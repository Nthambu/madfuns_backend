"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { rawBody: true });
    app.enableCors({
        origin: process.env.FRONTEND_URL ?? '*',
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Event Ticketing API')
        .setDescription('Sprints 1-3: Events · Auth · Paystack Checkout · Orders · Mail')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`\n🎟️  Ticketing API  →  http://localhost:${port}`);
    console.log(`📚  Swagger docs   →  http://localhost:${port}/api/docs\n`);
}
bootstrap();
//# sourceMappingURL=main.js.map