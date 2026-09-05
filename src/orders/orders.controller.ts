import {
  Controller, Get, Patch, Param,
  Body, Query, ParseUUIDPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard }   from '../auth/jwt-auth.guard';
import { OrdersService }  from './orders.service';
import { OrderStatus }    from './order.entity';

class UpdateStatusDto {
  @ApiProperty({ enum: ['pending', 'paid', 'failed', 'refunded'] })
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  status: OrderStatus;
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Revenue and sales summary (admin)' })
  getStats() { return this.ordersService.getStats(); }

  @Get()
  @ApiOperation({ summary: 'List all orders, optionally filter by event (admin)' })
  @ApiQuery({ name: 'eventId', required: false })
  findAll(@Query('eventId') eventId?: string) {
    return this.ordersService.findAll(eventId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single order (admin)' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status — e.g. mark refunded (admin)' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
