import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
export declare class CheckoutController {
    private readonly checkoutService;
    constructor(checkoutService: CheckoutService);
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
    verifyPayment(dto: VerifyPaymentDto): Promise<{
        orderId: string;
        orderNumber: string;
        alreadyProcessed: boolean;
    } | {
        orderId: string;
        orderNumber: string;
        alreadyProcessed?: undefined;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string, payload: any): Promise<{
        received: boolean;
    }>;
}
