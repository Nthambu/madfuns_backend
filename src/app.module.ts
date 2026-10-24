import { Module } from '@nestjs/common';
import { TypeOrmModule }  from '@nestjs/typeorm';
import { AuthModule }     from './auth/auth.module';
import { EventsModule }   from './events/events.module';
import { OrdersModule }   from './orders/orders.module';
import { CheckoutModule } from './checkout/checkout.module';
import { MailModule }     from './mail/mail.module';
import { Event }  from './events/event.entity';
import { Order }  from './orders/order.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type:     'postgres',
      host:     process.env.DB_HOST,
      port:     Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
    }),
    MailModule,
    AuthModule,
    EventsModule,
    OrdersModule,
    CheckoutModule,
    UserModule,
  ],
})
export class AppModule {}
