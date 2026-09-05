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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = require("nodemailer");
let MailService = MailService_1 = class MailService {
    constructor() {
        this.logger = new common_1.Logger(MailService_1.name);
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST ?? 'smtp.gmail.com',
            port: parseInt(process.env.MAIL_PORT ?? '587'),
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }
    async sendOrderConfirmation(order) {
        if (!process.env.MAIL_USER) {
            this.logger.warn('MAIL_USER not set — skipping confirmation email');
            return;
        }
        const subject = `Your tickets for ${order.event?.name ?? 'the event'} — ${order.order_number}`;
        try {
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
                to: order.customer_email,
                subject,
                html: this.buildTicketHtml(order),
                text: this.buildTicketText(order),
            });
            this.logger.log(`Confirmation email sent to ${order.customer_email} — ${order.order_number}`);
        }
        catch (err) {
            this.logger.error(`Failed to send email to ${order.customer_email}: ${err.message}`);
        }
    }
    buildTicketHtml(order) {
        const event = order.event;
        const eventName = event?.name ?? 'Event';
        const eventDate = event?.event_date
            ? new Date(event.event_date).toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
            })
            : 'See event page';
        const venue = [event?.venue, event?.city, event?.state]
            .filter(Boolean).join(', ') || 'TBA';
        const total = Number(order.total_amount).toFixed(2);
        const unitPrice = Number(order.unit_price).toFixed(2);
        const fee = Number(order.service_fee).toFixed(2);
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Tickets — ${order.order_number}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a56db;padding:32px 40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:26px;letter-spacing:-0.5px;">🎟️ You're going!</h1>
            <p style="color:#93b4f5;margin:8px 0 0;font-size:15px;">Your payment was successful</p>
          </td>
        </tr>

        <!-- Order number banner -->
        <tr>
          <td style="background:#eef3ff;padding:14px 40px;text-align:center;border-bottom:1px solid #dce6fb;">
            <span style="font-size:13px;color:#4b6cb7;letter-spacing:1px;text-transform:uppercase;">Order number</span>
            <div style="font-size:22px;font-weight:700;color:#1a56db;letter-spacing:2px;margin-top:4px;">${order.order_number}</div>
          </td>
        </tr>

        <!-- Event details -->
        <tr>
          <td style="padding:32px 40px;">
            <h2 style="margin:0 0 20px;font-size:20px;color:#111;">${eventName}</h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Date &amp; Time</div>
                  <div style="font-size:14px;color:#222;font-weight:500;">${eventDate}</div>
                </td>
                <td width="50%" style="padding-bottom:16px;vertical-align:top;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Venue</div>
                  <div style="font-size:14px;color:#222;font-weight:500;">${venue}</div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:16px;vertical-align:top;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Ticket type</div>
                  <div style="font-size:14px;color:#222;font-weight:500;">${order.ticket_type_name}</div>
                </td>
                <td style="padding-bottom:16px;vertical-align:top;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px;">Quantity</div>
                  <div style="font-size:14px;color:#222;font-weight:500;">${order.quantity} ticket${order.quantity > 1 ? 's' : ''}</div>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <hr style="border:none;border-top:1px solid #eee;margin:8px 0 20px;">

            <!-- Payment breakdown -->
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              <tr>
                <td style="padding:4px 0;color:#555;">Tickets (${order.quantity} × $${unitPrice})</td>
                <td align="right" style="color:#333;">$${(Number(unitPrice) * order.quantity).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 0;color:#555;">Service fee</td>
                <td align="right" style="color:#333;">$${fee}</td>
              </tr>
              <tr>
                <td style="padding:12px 0 4px;font-weight:700;font-size:15px;color:#111;border-top:1px solid #eee;">Total charged</td>
                <td align="right" style="padding-top:12px;font-weight:700;font-size:15px;color:#1a56db;border-top:1px solid #eee;">$${total}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Ticket stub -->
        <tr>
          <td style="padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:2px dashed #1a56db;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="background:#f0f4ff;padding:20px 24px;">
                  <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4b6cb7;margin-bottom:6px;">Your ticket</div>
                  <div style="font-size:16px;font-weight:700;color:#1a1a1a;">${eventName}</div>
                  <div style="font-size:13px;color:#555;margin-top:4px;">${order.ticket_type_name} · ${order.quantity} ticket${order.quantity > 1 ? 's' : ''}</div>
                  <div style="font-size:13px;color:#555;margin-top:2px;">${eventDate}</div>
                  <div style="margin-top:12px;font-family:monospace;font-size:13px;letter-spacing:3px;color:#1a56db;font-weight:700;">${order.order_number}</div>
                  <div style="font-size:11px;color:#888;margin-top:4px;">Present this email or order number at the venue</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What to bring -->
        <tr>
          <td style="padding:0 40px 32px;">
            <div style="background:#fff8ed;border:1px solid #f0c070;border-radius:6px;padding:16px 20px;">
              <div style="font-weight:700;color:#92400e;margin-bottom:8px;">📋 What to bring</div>
              <ul style="margin:0;padding-left:18px;color:#78350f;font-size:13px;line-height:1.8;">
                <li>This email (digital or printed)</li>
                <li>A valid photo ID matching the name on the order</li>
                <li>Arrive 30 minutes before the event starts</li>
              </ul>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999;">
              This purchase is <strong>non-refundable</strong>.<br>
              Questions? Reply to this email and we'll help you out.
            </p>
            <p style="margin:12px 0 0;font-size:11px;color:#bbb;">
              © ${new Date().getFullYear()} · Powered by Event Ticketing
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;
    }
    buildTicketText(order) {
        const event = order.event;
        const eventName = event?.name ?? 'Event';
        const total = Number(order.total_amount).toFixed(2);
        return `
YOU'RE GOING! — ${eventName}
Order: ${order.order_number}

EVENT: ${eventName}
Date:  ${event?.event_date ? new Date(event.event_date).toLocaleString('en-US') : 'See event page'}
Venue: ${[event?.venue, event?.city, event?.state].filter(Boolean).join(', ') || 'TBA'}

TICKETS
Type:     ${order.ticket_type_name}
Quantity: ${order.quantity}
Total:    $${total}

Present this email or your order number at the venue.
Bring a valid photo ID.

This purchase is non-refundable.
    `.trim();
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
//# sourceMappingURL=mail.service.js.map