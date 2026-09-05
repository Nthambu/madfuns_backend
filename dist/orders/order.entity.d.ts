import { Event } from '../events/event.entity';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export declare class Order {
    id: string;
    order_number: string;
    event: Event;
    event_id: string;
    ticket_type_index: number;
    ticket_type_name: string;
    quantity: number;
    unit_price: number;
    service_fee: number;
    total_amount: number;
    customer_email: string;
    customer_name: string;
    customer_phone: string;
    billing_address: {
        line1?: string;
        city?: string;
        state?: string;
        postal_code?: string;
    };
    payment_reference: string;
    payment_method: string;
    currency: string;
    status: OrderStatus;
    created_at: Date;
}
