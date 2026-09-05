import { Module } from '@nestjs/common';
import { CheckoutController } from './checkout.controller';
import { CheckoutService }    from './checkout.service';
import { EventsModule }       from '../events/events.module';
import { OrdersModule }       from '../orders/orders.module';

@Module({
  imports:     [EventsModule, OrdersModule],
  controllers: [CheckoutController],
  providers:   [CheckoutService],
})
export class CheckoutModule {}
