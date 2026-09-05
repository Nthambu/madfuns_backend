export interface TicketType {
    name: string;
    price: number;
    available: number;
    description?: string;
}
export declare class Event {
    id: string;
    name: string;
    description: string;
    venue: string;
    city: string;
    state: string;
    event_date: Date;
    ticket_types: TicketType[];
    facebook_url: string;
    image_url: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}
