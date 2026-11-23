"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./event.entity");
let EventsService = class EventsService {
    constructor(repo, dataSource) {
        this.repo = repo;
        this.dataSource = dataSource;
    }
    findAll() {
        return this.repo.find({ where: { active: true }, order: { event_date: 'DESC' } });
    }
    findAllAdmin() {
        return this.repo.find({ order: { created_at: 'DESC' } });
    }
    async findOne(id) {
        const event = await this.repo.findOne({ where: { id } });
        if (!event)
            throw new common_1.NotFoundException(`Event ${id} not found`);
        return event;
    }
    async create(dto) {
        return this.repo.save(this.repo.create(dto));
    }
    async update(id, dto) {
        const event = await this.findOne(id);
        Object.assign(event, dto);
        return this.repo.save(event);
    }
    async remove(id) {
        const event = await this.findOne(id);
        event.active = false;
        await this.repo.save(event);
        return { message: `Event "${event.name}" deactivated` };
    }
    async decrementTicketInArray(eventId, ticketName, purchasedQty) {
        return this.dataSource.transaction(async (manager) => {
            const event = await manager.findOne(event_entity_1.Event, {
                where: { id: eventId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!event) {
                throw new common_1.NotFoundException('Event not found');
            }
            const ticket = event.ticket_types.find((t) => t.name === ticketName);
            if (!ticket) {
                throw new common_1.NotFoundException(`Ticket type "${ticketName}" not found`);
            }
            if (ticket.available < purchasedQty) {
                throw new common_1.BadRequestException('Not enough tickets remaining');
            }
            ticket.available -= purchasedQty;
            return manager.save(event);
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], EventsService);
//# sourceMappingURL=events.service.js.map