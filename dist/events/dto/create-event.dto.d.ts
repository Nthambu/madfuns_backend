export declare class TicketTypeDto {
    name: string;
    price: number;
    available: number;
    description?: string;
}
export declare class CreateEventDto {
    name: string;
    description?: string;
    venue?: string;
    city?: string;
    state?: string;
    event_date: string;
    location: string;
    host: string;
    ticket_types: TicketTypeDto[];
    facebook_url?: string;
    image_url?: string;
    shareurl?: string;
}
