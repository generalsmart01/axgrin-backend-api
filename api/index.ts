import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../src/common/filters/high-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  
  // Configure body parsers directly on Express app
  expressApp.use(express.json({ limit: '10mb' }));
  expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    rawBody: true,
  });

  // Enable CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:3002',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3003',
        'https://axgrin.vercel.app',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Axgrin API')
      .setDescription('Axgrin Backend API Documentation')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User management operations')
      .addTag('Expenses', 'Expense tracking and management')
      .addTag('Budget Goals', 'Budget goal setting and monitoring')
      .addTag('Categories', 'Expense category management')
      .addTag('Chat History', 'AI chat conversation storage')
      .addTag('Analytics', 'Financial analytics and insights')
      .addTag('Profile', 'User profile management')
      .addTag('Settings', 'User preferences and settings')
      .addTag('Notifications', 'User notification management')
      .addTag('Income', 'Income tracking and management')
      .addTag('Admin Dashboard', 'Admin dashboard statistics and management')
      .addTag('Admin - Subscription Configuration', 'Admin subscription pricing and trial configuration')
      .addTag('Admin - Subscription Analytics', 'Admin subscription metrics and analytics')
      .addTag('Admin - Subscription Management', 'Admin subscription management and operations')
      .addTag('Reports', 'Financial reports generation (Premium)')
      .addTag('Activity Analytics', 'User activity tracking and analytics')
      .addTag('Payment & Subscriptions', 'Premium subscription payment and management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
      },
    });
  }

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Configure helmet to not interfere with CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
    }),
  );

  await app.init();
  cachedApp = expressApp;
  return expressApp;
}

export default async function handler(req: Request, res: Response) {
  const app = await createApp();
  app(req, res);
}

