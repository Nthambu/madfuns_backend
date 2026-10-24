import { Order } from '../orders/order.entity';
export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendOtpEmail(to: string, otp: string): Promise<void>;
    sendOrderConfirmation(order: Order): Promise<void>;
    private buildTicketHtml;
    private buildTicketText;
}
