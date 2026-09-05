import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  order_number: string;

  @ManyToOne(() => Event, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ nullable: true })
  event_id: string;

  @Column()
  ticket_type_index: number;

  @Column({ length: 255 })
  ticket_type_name: string;

  @Column()
  quantity: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  service_fee: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  total_amount: number;

  @Column({ length: 255 })
  customer_email: string;

  @Column({ length: 255 })
  customer_name: string;

  @Column({ length: 50, nullable: true })
  customer_phone: string;

  @Column({ type: 'jsonb', nullable: true })
  billing_address: {
    line1?: string; city?: string; state?: string; postal_code?: string;
  };

  /** Paystack transaction reference e.g. tkt_1715000000_abc123 */
  @Column({ nullable: true, length: 100 })
  payment_reference: string;

  /** card | mobile_money | bank | ussd */
  @Column({ length: 50, default: 'card' })
  payment_method: string;

  @Column({ length: 10, default: 'KES' })
  currency: string;

  @Column({ length: 50, default: 'pending' })
  status: OrderStatus;

  @CreateDateColumn()
  created_at: Date;
}
