import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
export declare class OrdersService {
    private readonly repo;
    constructor(repo: Repository<Order>);
    findAll(eventId?: string): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    findByReference(reference: string): Promise<Order | null>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
    getStats(): Promise<{
        total_orders: number;
        total_revenue: number;
        paid_orders: number;
        pending_orders: number;
        tickets_sold: number;
    }>;
    create(data: Partial<Order>): Promise<Order>;
}
