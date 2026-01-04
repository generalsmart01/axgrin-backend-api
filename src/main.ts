// main.ts
// Register module paths for runtime resolution (only needed in production/compiled code)
// In development, tsconfig-paths/register handles this
// Check if we're running compiled JS (not TS) by checking if __filename ends with .js
const isCompiled = __filename.endsWith('.js') || process.env.NODE_ENV === 'production';
if (isCompiled) {
  try {
    const moduleAlias = require('module-alias');
    const path = require('path');
    // When compiled, main.ts becomes dist/src/main.js, so __dirname is dist/src
    // Therefore, dist/prisma is at path.join(__dirname, '..', 'prisma')
    // And dist/src is at __dirname
    moduleAlias.addAliases({
      'prisma': path.join(__dirname, '..', 'prisma'),
      'src': __dirname, // Map 'src' imports to dist/src
    });
  } catch (e) {
    // module-alias not available, skip (shouldn't happen in production)
    console.warn('module-alias not available, skipping alias setup');
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/high-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhooks
  });

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3003',
      'https://axgrin.vercel.app',
    ], // Add your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Allow cookies and authorization headers
  });

  // Enable Swagger in all environments (can be disabled via env var if needed)
  if (process.env.DISABLE_SWAGGER !== 'true') {
    const config = new DocumentBuilder()
      .setTitle('Axgrin API')
      .setDescription(
        `
# Axgrin Backend API Documentation

A comprehensive personal finance management API that helps users track expenses, manage budgets, and get AI-powered financial advice.

## Features

- **Expense Management**: Track and categorize your spending
- **Budget Goals**: Set and monitor budget targets for different categories
- **Category Management**: Organize expenses with custom categories
- **Chat History**: Store AI-powered financial advice conversations
- **User Authentication**: Secure JWT-based authentication
- **Analytics**: Get insights into your spending patterns

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## User Roles

The API supports the following user roles:

- **USER** (Default): Standard user with full access to personal finance features
- **ADMIN**: System administrator with full system access
- **PREMIUM**: Paid subscription tier with advanced features (unlimited AI, exports, advanced analytics)
- **VIEWER**: Read-only access for data sharing (accountants, advisors, auditors)

See \`ROLES_DOCUMENTATION.md\` for detailed role permissions and usage.

## Rate Limiting

API requests are rate-limited to 100 requests per 15-minute window to prevent abuse.

## Data Types

- **Numbers**: Use decimal format for currency (e.g., 150.50)
- **Dates**: Use ISO 8601 format (e.g., "2024-01-15T10:30:00.000Z")
- **UUIDs**: Use cuid format for identifiers (e.g., "clx1234567890abcdef")
      `,
      )
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
      .addTag(
        'Admin - Subscription Configuration',
        'Admin subscription pricing and trial configuration',
      )
      .addTag(
        'Admin - Subscription Analytics',
        'Admin subscription metrics and analytics',
      )
      .addTag(
        'Admin - Subscription Management',
        'Admin subscription management and operations',
      )
      .addTag('Reports', 'Financial reports generation (Premium)')
      .addTag('Activity Analytics', 'User activity tracking and analytics')
      .addTag(
        'Payment & Subscriptions',
        'Premium subscription payment and management',
      )
      .addTag('Support Tickets', 'Support ticket management system')
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
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 100,
    }),
  );

  const port = process.env.PORT || 3300;
  await app.listen(port);
  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
