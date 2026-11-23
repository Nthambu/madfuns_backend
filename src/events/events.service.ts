import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    private readonly dataSource:DataSource
  ) {}

  findAll(): Promise<Event[]> {
    return this.repo.find({ where: { active: true }, order: { event_date: 'DESC' } });
  }

  findAllAdmin(): Promise<Event[]> {
    return this.repo.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event ${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto): Promise<Event> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    Object.assign(event, dto);
    return this.repo.save(event);
  }

  async remove(id: string): Promise<{ message: string }> {
    const event = await this.findOne(id);
    event.active = false;
    await this.repo.save(event);
    return { message: `Event "${event.name}" deactivated` };
  }
  async decrementTicketInArray(
  eventId: string,
  ticketName: string,
  purchasedQty: number,
): Promise<Event> {
  return this.dataSource.transaction(async (manager) => {
    // 1. Lock the event row until the transaction completes
    const event = await manager.findOne(Event, {
      where: { id: eventId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // 2. Find the specific ticket type in the JSONB array
    const ticket = event.ticket_types.find((t) => t.name === ticketName);
    if (!ticket) {
      throw new NotFoundException(`Ticket type "${ticketName}" not found`);
    }

    if (ticket.available < purchasedQty) {
      throw new BadRequestException('Not enough tickets remaining');
    }

    // 3. Decrement and save
    ticket.available-= purchasedQty;
    return manager.save(event);
  });
}

}
