// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // Handle validation errors (BadRequestException with array of messages)
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;

        // Check if it's a validation error with message array
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message;
          error = responseObj.error || 'Bad Request';
        } else {
          // Regular error with string message
          message = responseObj.message || exception.message;
          error = responseObj.error || 'Bad Request';
        }
      } else {
        // String response
        message = exceptionResponse as string;
        error = 'Bad Request';
      }
    } else {
      // Non-HTTP exceptions
      message = exception.message || 'Internal server error';
      error = 'Internal Server Error';
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
