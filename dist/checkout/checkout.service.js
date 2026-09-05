"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CheckoutService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const crypto = require("crypto");
const events_service_1 = require("../events/events.service");
const orders_service_1 = require("../orders/orders.service");
const mail_service_1 = require("../mail/mail.service");
function generateReference() {
    const rand = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `TKT-${Date.now()}-${rand}`;
}
function generateOrderNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `TKT-${suffix}`;
}
let CheckoutService = CheckoutService_1 = class CheckoutService {
    constructor(eventsService, ordersService, mailService) {
        this.eventsService = eventsService;
        this.ordersService = ordersService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(CheckoutService_1.name);
        this.serviceFee = parseFloat(process.env.SERVICE_FEE_PER_TICKET ?? '200');
        this.currency = process.env.PAYSTACK_CURRENCY ?? 'KES';
        const secretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!secretKey) {
            this.logger.warn('PAYSTACK_SECRET_KEY not set — checkout will not work');
        }
        this.http = axios_1.default.create({
            baseURL: 'https://api.paystack.co',
            headers: {
                Authorization: `Bearer ${secretKey ?? ''}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async initializePayment(dto) {
        const event = await this.eventsService.findOne(dto.eventId);
        if (!event.active) {
            throw new common_1.BadRequestException('This event is no longer available');
        }
        const ticketType = event.ticket_types[dto.ticketTypeIndex];
        if (!ticketType) {
            throw new common_1.BadRequestException(`Ticket type at index ${dto.ticketTypeIndex} does not exist`);
        }
        const subtotal = ticketType.price * dto.quantity;
        const totalFee = parseFloat((this.serviceFee * dto.quantity).toFixed(2));
        const total = parseFloat((subtotal + totalFee).toFixed(2));
        const amountInMinorUnits = Math.round(total * 100);
        const reference = generateReference();
        try {
            const { data } = await this.http.post('/transaction/initialize', {
                email: dto.customerEmail,
                amount: amountInMinorUnits,
                reference,
                currency: this.currency,
                callback_url: `${process.env.FRONTEND_URL ?? 'http://localhost:4200'}/success?ref=${reference}`,
                metadata: {
                    custom_fields: [
                        { display_name: 'Customer Name', variable_name: 'customerName', value: dto.customerName },
                        { display_name: 'Phone', variable_name: 'customerPhone', value: dto.customerPhone ?? '' },
                        { display_name: 'Event', variable_name: 'eventName', value: event.name },
                        { display_name: 'Ticket Type', variable_name: 'ticketType', value: ticketType.name },
                    ],
                    eventId: dto.eventId,
                    ticketTypeIndex: dto.ticketTypeIndex,
                    ticketTypeName: ticketType.name,
                    quantity: dto.quantity,
                    customerName: dto.customerName,
                    customerPhone: dto.customerPhone ?? '',
                },
            });
            const { authorization_url, access_code } = data.data;
            this.logger.log(`Payment initialized: ref=${reference} amount=${total}${this.currency} event="${event.name}"`);
            return {
                authorizationUrl: authorization_url,
                accessCode: access_code,
                reference,
                breakdown: {
                    ticketType: ticketType.name,
                    unitPrice: ticketType.price,
                    quantity: dto.quantity,
                    subtotal,
                    serviceFee: totalFee,
                    total,
                    currency: this.currency,
                },
            };
        }
        catch (err) {
            const message = err.response?.data?.message ?? err.message;
            this.logger.error(`Paystack initialize failed: ${message}`);
            throw new common_1.InternalServerErrorException(`Payment initialization failed: ${message}`);
        }
    }
    async verifyAndSaveOrder(dto) {
        const existing = await this.ordersService.findByReference(dto.reference);
        if (existing) {
            this.logger.log(`Order already exists for ref=${dto.reference} — returning existing`);
            return { orderId: existing.id, orderNumber: existing.order_number, alreadyProcessed: true };
        }
        let txn;
        try {
            const { data } = await this.http.get(`/transaction/verify/${dto.reference}`);
            txn = data.data;
        }
        catch (err) {
            const message = err.response?.data?.message ?? err.message;
            throw new common_1.BadRequestException(`Could not verify payment: ${message}`);
        }
        if (txn.status !== 'success') {
            throw new common_1.BadRequestException(`Payment not completed — Paystack status: "${txn.status}"`);
        }
        const meta = txn.metadata;
        const totalPaid = txn.amount / 100;
        const feeTotal = parseFloat((this.serviceFee * Number(meta.quantity)).toFixed(2));
        const unitPrice = parseFloat(((totalPaid - feeTotal) / Number(meta.quantity)).toFixed(2));
        const order = await this.ordersService.create({
            order_number: generateOrderNumber(),
            event_id: meta.eventId,
            ticket_type_index: Number(meta.ticketTypeIndex),
            ticket_type_name: meta.ticketTypeName,
            quantity: Number(meta.quantity),
            unit_price: unitPrice,
            service_fee: feeTotal,
            total_amount: totalPaid,
            customer_email: txn.customer.email,
            customer_name: meta.customerName,
            customer_phone: meta.customerPhone || dto.customerPhone,
            billing_address: dto.billingAddress,
            payment_reference: dto.reference,
            payment_method: txn.channel,
            currency: txn.currency,
            status: 'paid',
        });
        this.logger.log(`Order saved: ${order.order_number} | ref=${dto.reference} | ${totalPaid} ${txn.currency}`);
        this.mailService.sendOrderConfirmation(order).catch(err => this.logger.error(`Email failed for ${order.order_number}: ${err.message}`));
        return { orderId: order.id, orderNumber: order.order_number };
    }
    async handleWebhook(rawBody, signature, payload) {
        const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
        const expectedSig = crypto
            .createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex');
        if (expectedSig !== signature) {
            this.logger.warn('Webhook received with invalid signature — rejected');
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        this.logger.log(`Webhook received: event="${payload.event}"`);
        if (payload.event === 'charge.success') {
            const reference = payload.data?.reference;
            if (!reference)
                return { received: true };
            await this.verifyAndSaveOrder({ reference }).catch(err => this.logger.error(`Webhook order save failed for ref=${reference}: ${err.message}`));
        }
        return { received: true };
    }
};
exports.CheckoutService = CheckoutService;
exports.CheckoutService = CheckoutService = CheckoutService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        orders_service_1.OrdersService,
        mail_service_1.MailService])
], CheckoutService);
//# sourceMappingURL=checkout.service.js.map