import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseUUIDPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService }    from './events.service';
import { CreateEventDto }   from './dto/create-event.dto';
import { UpdateEventDto }   from './dto/update-event.dto';
import { JwtAuthGuard }     from '../auth/jwt-auth.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // ── Public ──────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List active events (public)' })
  findAll() { return this.eventsService.findAll(); }

  @Get(':id')
  @ApiOperation({ summary: 'Get one event (public)' })
  @ApiResponse({ status: 404, description: 'Not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  // ── Admin — JWT required ─────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'List ALL events including inactive (admin)' })
  findAllAdmin() { return this.eventsService.findAllAdmin(); }

  @Post()
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Create event (admin)' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateEventDto) { return this.eventsService.create(dto); }

  @Patch(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEventDto) {
    return this.eventsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete event (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
