import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

export interface TicketType {
  name:         string;
  price:        number;
  available:    number;
  description?: string;
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  venue: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 50, nullable: true })
  state: string;

  @Column({ type: 'timestamptz' })
  event_date: Date;

  @Column({ type: 'jsonb', default: '[]' })
  ticket_types: TicketType[];

  @Column({ length: 500, nullable: true })
  facebook_url: string;

  @Column({ length: 500, nullable: true })
  image_url: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
