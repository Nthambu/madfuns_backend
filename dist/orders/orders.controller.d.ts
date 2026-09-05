import { OrdersService } from './orders.service';
import { OrderStatus } from './order.entity';
declare class UpdateStatusDto {
    status: OrderStatus;
}
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getStats(): Promise<{
        total_orders: number;
        total_revenue: number;
        paid_orders: number;
        pending_orders: number;
        tickets_sold: number;
    }>;
    findAll(eventId?: string): Promise<import("./order.entity").Order[]>;
    findOne(id: string): Promise<import("./order.entity").Order>;
    updateStatus(id: string, dto: UpdateStatusDto): Promise<import("./order.entity").Order>;
}
export {};
