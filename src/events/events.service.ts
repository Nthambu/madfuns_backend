import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  findAll(): Promise<Event[]> {
    return this.repo.find({ where: { active: true }, order: { event_date: 'ASC' } });
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
}
