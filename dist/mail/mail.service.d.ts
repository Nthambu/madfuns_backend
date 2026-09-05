import { Order } from '../orders/order.entity';
export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendOrderConfirmation(order: Order): Promise<void>;
    private buildTicketHtml;
    private buildTicketText;
}
