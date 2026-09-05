import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    findAll(): Promise<import("./event.entity").Event[]>;
    findOne(id: string): Promise<import("./event.entity").Event>;
    findAllAdmin(): Promise<import("./event.entity").Event[]>;
    create(dto: CreateEventDto): Promise<import("./event.entity").Event>;
    update(id: string, dto: UpdateEventDto): Promise<import("./event.entity").Event>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
