import { DataSource, Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly repo;
    private readonly dataSource;
    constructor(repo: Repository<Event>, dataSource: DataSource);
    findAll(): Promise<Event[]>;
    findAllAdmin(): Promise<Event[]>;
    findOne(id: string): Promise<Event>;
    create(dto: CreateEventDto): Promise<Event>;
    update(id: string, dto: UpdateEventDto): Promise<Event>;
    remove(id: string): Promise<{
        message: string;
    }>;
    decrementTicketInArray(eventId: string, ticketName: string, purchasedQty: number): Promise<Event>;
}
