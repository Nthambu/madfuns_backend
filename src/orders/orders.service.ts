import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly repo: Repository<Order>,
  ) {}

  findAll(eventId?: string): Promise<Order[]> {
    const qb = this.repo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.event', 'event')
      .orderBy('order.created_at', 'DESC');
    if (eventId) qb.where('order.event_id = :eventId', { eventId });
    return qb.getMany();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.repo.findOne({ where: { id }, relations: ['event'] });
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  findByReference(reference: string): Promise<Order | null> {
    return this.repo.findOne({ where: { payment_reference: reference } });
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.repo.save(order);
  }

  async getStats() {
    const result = await this.repo
      .createQueryBuilder('order')
      .select('COUNT(*)',                                           'total_orders')
      .addSelect('COALESCE(SUM(order.total_amount), 0)',           'total_revenue')
      .addSelect(`COUNT(*) FILTER (WHERE order.status = 'paid')`,  'paid_orders')
      .addSelect(`COUNT(*) FILTER (WHERE order.status = 'pending')`,'pending_orders')
      .addSelect(
        `COALESCE(SUM(order.quantity) FILTER (WHERE order.status = 'paid'), 0)`,
        'tickets_sold',
      )
      .getRawOne();

    return {
      total_orders:   Number(result.total_orders),
      total_revenue:  Number(result.total_revenue),
      paid_orders:    Number(result.paid_orders),
      pending_orders: Number(result.pending_orders),
      tickets_sold:   Number(result.tickets_sold),
    };
  }

  create(data: Partial<Order>): Promise<Order> {
    return this.repo.save(this.repo.create(data));
  }
}
