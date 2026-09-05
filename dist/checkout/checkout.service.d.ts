import { EventsService } from '../events/events.service';
import { OrdersService } from '../orders/orders.service';
import { MailService } from '../mail/mail.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class CheckoutService {
    private readonly eventsService;
    private readonly ordersService;
    private readonly mailService;
    private readonly logger;
    private readonly http;
    private readonly serviceFee;
    private readonly currency;
    constructor(eventsService: EventsService, ordersService: OrdersService, mailService: MailService);
    initializePayment(dto: InitializePaymentDto): Promise<{
        authorizationUrl: any;
        accessCode: any;
        reference: string;
        breakdown: {
            ticketType: string;
            unitPrice: number;
            quantity: number;
            subtotal: number;
            serviceFee: number;
            total: number;
            currency: string;
        };
    }>;
    verifyAndSaveOrder(dto: VerifyPaymentDto): Promise<{
        orderId: string;
        orderNumber: string;
        alreadyProcessed: boolean;
    } | {
        orderId: string;
        orderNumber: string;
        alreadyProcessed?: undefined;
    }>;
    handleWebhook(rawBody: string, signature: string, payload: any): Promise<{
        received: boolean;
    }>;
}
