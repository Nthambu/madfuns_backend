import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import { EventsService }          from '../events/events.service';
import { OrdersService }          from '../orders/orders.service';
import { MailService }            from '../mail/mail.service';
import { InitializePaymentDto }   from './dto/initialize-payment.dto';
import { VerifyPaymentDto }       from './dto/verify-payment.dto';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Generates a short unique Paystack reference tied to this app */
function generateReference(): string {
  const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
  return `TKT-${Date.now()}-${rand}`;
}

/** Generates a human-readable order number shown on tickets */
function generateOrderNumber(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const suffix = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
  return `TKT-${suffix}`;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private readonly http: AxiosInstance;

  /** Flat service fee per ticket in the configured currency */
  private readonly serviceFee = parseFloat(
    process.env.SERVICE_FEE_PER_TICKET ?? '200',
  );

  /** ISO 4217 currency code — KES for Kenya, USD for international */
  private readonly currency = process.env.PAYSTACK_CURRENCY ?? 'KES';

  constructor(
    private readonly eventsService: EventsService,
    private readonly ordersService: OrdersService,
    private readonly mailService:   MailService,
  ) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      this.logger.warn('PAYSTACK_SECRET_KEY not set — checkout will not work');
    }

    // Pre-configure axios with Paystack base URL and auth header
    this.http = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${secretKey ?? ''}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ── Step 1: Initialize Paystack transaction ──────────────────────────────

  async initializePayment(dto: InitializePaymentDto) {
    // Validate event and ticket type
    const event = await this.eventsService.findOne(dto.eventId);
    if (!event.active) {
      throw new BadRequestException('This event is no longer available');
    }

    const ticketType = event.ticket_types[dto.ticketTypeIndex];
    if (!ticketType) {
      throw new BadRequestException(
        `Ticket type at index ${dto.ticketTypeIndex} does not exist`,
      );
    }

    // Calculate amounts
    const subtotal    = ticketType.price * dto.quantity;
    const totalFee    = parseFloat((this.serviceFee * dto.quantity).toFixed(2));
    const total       = parseFloat((subtotal + totalFee).toFixed(2));

    // Paystack uses the smallest currency unit (kobo / cents) — multiply by 100
    const amountInMinorUnits = Math.round(total * 100);

    // Unique reference for this transaction
    const reference = generateReference();

    // Call Paystack initialize endpoint
    try {
      const { data } = await this.http.post('/transaction/initialize', {
        email:        dto.customerEmail,
        amount:       amountInMinorUnits,
        reference,
        currency:     this.currency,
        callback_url: `${process.env.FRONTEND_URL ?? 'http://localhost:4200'}/success?ref=${reference}`,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name',  variable_name: 'customerName',  value: dto.customerName },
            { display_name: 'Phone',          variable_name: 'customerPhone', value: dto.customerPhone ?? '' },
            { display_name: 'Event',          variable_name: 'eventName',     value: event.name },
            { display_name: 'Ticket Type',    variable_name: 'ticketType',    value: ticketType.name },
          ],
          // Internal metadata used during verification
          eventId:          dto.eventId,
          ticketTypeIndex:  dto.ticketTypeIndex,
          ticketTypeName:   ticketType.name,
          quantity:         dto.quantity,
          customerName:     dto.customerName,
          customerPhone:    dto.customerPhone ?? '',
        },
      });

      const { authorization_url, access_code } = data.data;

      this.logger.log(
        `Payment initialized: ref=${reference} amount=${total}${this.currency} event="${event.name}"`,
      );

      return {
        authorizationUrl: authorization_url,  // full redirect URL (for mobile / fallback)
        accessCode:       access_code,         // used by Paystack Inline JS popup
        reference,
        breakdown: {
          ticketType:  ticketType.name,
          unitPrice:   ticketType.price,
          quantity:    dto.quantity,
          subtotal,
          serviceFee:  totalFee,
          total,
          currency:    this.currency,
        },
      };
    } catch (err) {
      const message = err.response?.data?.message ?? err.message;
      this.logger.error(`Paystack initialize failed: ${message}`);
      throw new InternalServerErrorException(`Payment initialization failed: ${message}`);
    }
  }

  // ── Step 2: Verify payment and save order ────────────────────────────────

  async verifyAndSaveOrder(dto: VerifyPaymentDto) {
    // Idempotency — never create duplicate orders for the same reference
    const existing = await this.ordersService.findByReference(dto.reference);
    if (existing) {
      this.logger.log(`Order already exists for ref=${dto.reference} — returning existing`);
      return { orderId: existing.id, orderNumber: existing.order_number, alreadyProcessed: true };
    }

    // Verify with Paystack (source of truth)
    let txn: any;
    try {
      const { data } = await this.http.get(`/transaction/verify/${dto.reference}`);
      txn = data.data;
    } catch (err) {
      const message = err.response?.data?.message ?? err.message;
      throw new BadRequestException(`Could not verify payment: ${message}`);
    }

    if (txn.status !== 'success') {
      throw new BadRequestException(
        `Payment not completed — Paystack status: "${txn.status}"`,
      );
    }

    // Extract metadata (stored during initialization)
    const meta = txn.metadata as {
      eventId:         string;
      ticketTypeIndex: number;
      ticketTypeName:  string;
      quantity:        number;
      customerName:    string;
      customerPhone:   string;
    };

    const totalPaid   = txn.amount / 100;                         // convert back from minor units
    const feeTotal    = parseFloat((this.serviceFee * Number(meta.quantity)).toFixed(2));
    const unitPrice   = parseFloat(
      ((totalPaid - feeTotal) / Number(meta.quantity)).toFixed(2),
    );

    // Save the order
    const order = await this.ordersService.create({
      order_number:       generateOrderNumber(),
      event_id:           meta.eventId,
      ticket_type_index:  Number(meta.ticketTypeIndex),
      ticket_type_name:   meta.ticketTypeName,
      quantity:           Number(meta.quantity),
      unit_price:         unitPrice,
      service_fee:        feeTotal,
      total_amount:       totalPaid,
      customer_email:     txn.customer.email,
      customer_name:      meta.customerName,
      customer_phone:     meta.customerPhone || dto.customerPhone,
      billing_address:    dto.billingAddress,
      payment_reference:  dto.reference,
      payment_method:     txn.channel,     // 'card', 'mobile_money', 'ussd', 'bank'
      currency:           txn.currency,
      status:             'paid',
    });

    this.logger.log(
      `Order saved: ${order.order_number} | ref=${dto.reference} | ${totalPaid} ${txn.currency}`,
    );

    // Send confirmation email (non-blocking — never fails the request)
    this.mailService.sendOrderConfirmation(order).catch(err =>
      this.logger.error(`Email failed for ${order.order_number}: ${err.message}`),
    );

    return { orderId: order.id, orderNumber: order.order_number };
  }

  // ── Webhook: Paystack → your server (backup confirmation path) ──────────

  async handleWebhook(rawBody: string, signature: string, payload: any) {
    // 1. Verify HMAC-SHA512 signature
    const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
    const expectedSig = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      this.logger.warn('Webhook received with invalid signature — rejected');
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Webhook received: event="${payload.event}"`);

    // 2. Handle charge.success — the only event we care about
    if (payload.event === 'charge.success') {
      const reference = payload.data?.reference;
      if (!reference) return { received: true };

      // Use verifyAndSaveOrder — it's idempotent, so safe to call even if already processed
      await this.verifyAndSaveOrder({ reference }).catch(err =>
        this.logger.error(`Webhook order save failed for ref=${reference}: ${err.message}`),
      );
    }

    return { received: true };
  }
}
