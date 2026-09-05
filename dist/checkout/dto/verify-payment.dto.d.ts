declare class BillingAddressDto {
    line1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
}
export declare class VerifyPaymentDto {
    reference: string;
    customerPhone?: string;
    billingAddress?: BillingAddressDto;
}
export {};
