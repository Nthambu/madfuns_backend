"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const events_module_1 = require("./events/events.module");
const orders_module_1 = require("./orders/orders.module");
const checkout_module_1 = require("./checkout/checkout.module");
const mail_module_1 = require("./mail/mail.module");
const event_entity_1 = require("./events/event.entity");
const order_entity_1 = require("./orders/order.entity");
const config_1 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USER,
                database: process.env.DB_NAME,
                password: process.env.DB_PASSWORD,
                entities: [event_entity_1.Event, order_entity_1.Order],
                synchronize: process.env.NODE_ENV !== 'production',
                ssl: process.env.NODE_ENV === 'production'
                    ? { rejectUnauthorized: false }
                    : false,
                logging: process.env.NODE_ENV === 'development',
            }),
            mail_module_1.MailModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            orders_module_1.OrdersModule,
            checkout_module_1.CheckoutModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map