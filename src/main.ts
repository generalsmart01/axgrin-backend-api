// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/high-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3002',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3003',
    ], // Add your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Allow cookies and authorization headers
  });

  if (process.env.NODE_ENV !== 'production') {
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
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 mins
      max: 100,
    }),
  );

  await app.listen(3300);
  console.log(`🚀 Server is running on: http://localhost:3300`);
  console.log(`📚 API Documentation: http://localhost:3300/api/docs`);
}
bootstrap();
