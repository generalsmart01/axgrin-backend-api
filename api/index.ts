// Register module paths for runtime resolution
import * as path from 'path';

// Set up module aliases for runtime resolution (using require to avoid TS errors)
// When compiled, api/index.ts becomes dist/api/index.js, so __dirname is dist/api
// Therefore, dist/prisma is at path.join(__dirname, '..', 'prisma')
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  'prisma': path.join(__dirname, '..', 'prisma'),
});

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../src/common/filters/high-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

let cachedApp: express.Express;

async function createApp(): Promise<express.Express> {
  if (cachedApp) {
    console.log('Using cached app');
    return cachedApp;
  }

  try {
    console.log('Initializing NestJS app...');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    
    const expressApp = express();
  
    // Configure CORS at Express level first (before NestJS)
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : [
          'http://localhost:3002',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3003',
          'https://axgrin.vercel.app',
        ];

    // Handle preflight OPTIONS requests
    expressApp.use((req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization, Accept',
        );
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      }

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
      }

      next();
    });
    
    // Configure body parsers directly on Express app
    expressApp.use(express.json({ limit: '10mb' }));
    expressApp.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    const adapter = new ExpressAdapter(expressApp);

    const app = await NestFactory.create(AppModule, adapter, {
      rawBody: true,
    });

    // Enable CORS in NestJS as well (redundant but ensures coverage)
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });

    // Enable Swagger in all environments (including production)
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

    console.log('Initializing NestJS application...');
    await app.init();
    console.log('NestJS app initialized successfully');
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    console.error('Error creating NestJS app:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    // Set CORS headers before handling the request
    const origin = req.headers.origin;
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : [
          'http://localhost:3002',
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3003',
          'https://axgrin.vercel.app',
        ];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, Accept',
      );
    }

    // Handle preflight requests immediately
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const app = await createApp();
    app(req, res);
  } catch (error) {
    console.error('Serverless function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Set CORS headers even for errors
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    
    res.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : errorMessage,
      ...(process.env.NODE_ENV !== 'production' && errorStack && { stack: errorStack }),
    });
  }
}

