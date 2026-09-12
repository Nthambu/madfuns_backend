import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

async function bootstrap() {
  // rawBody: true — required so the webhook controller can verify Paystack HMAC signature
  const app = await NestFactory.create(AppModule, { rawBody: true });
const frontendUrls= process.env.FRONTEND_URL  ?  process.env.FRONTEND_URL.split(',').map((url)=>url.trim()) : ['localhosts://4200']
  app.enableCors({
    origin: frontendUrls,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:true
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );

  const config = new DocumentBuilder()
    .setTitle('Event Ticketing API')
    .setDescription('Sprints 1-3: Events · Auth · Paystack Checkout · Orders · Mail')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🎟️  Ticketing API  →  http://localhost:${port}`);
  console.log(`📚  Swagger docs   →  http://localhost:${port}/api/docs\n`);
}
bootstrap();
