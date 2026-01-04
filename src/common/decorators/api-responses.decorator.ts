import { applyDecorators, Type } from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../dto/error-response.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

/**
 * Standard success response decorator
 */
export function ApiSuccessResponse<T>(type: Type<T> | Function, description: string = 'Operation successful') {
  // Handle array types
  if (type === Array) {
    return ApiOkResponse({
      description,
      schema: {
        type: 'array',
      },
    });
  }
  
  return ApiOkResponse({
    description,
    type: type as Type<T>,
  });
}

/**
 * Standard created response decorator
 */
export function ApiCreatedResponseDecorator<T>(type: Type<T>, description: string = 'Resource created successfully') {
  return ApiCreatedResponse({
    description,
    type,
  });
}

/**
 * Standard paginated response decorator
 */
export function ApiPaginatedResponse<T>(itemType: Type<T>, description: string = 'Paginated results') {
  return ApiOkResponse({
    description,
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: `#/components/schemas/${itemType.name}` },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            totalPages: { type: 'number', example: 8 },
            hasNextPage: { type: 'boolean', example: true },
            hasPreviousPage: { type: 'boolean', example: false },
          },
        },
      },
    },
  });
}

/**
 * Standard error responses (401, 400, 500)
 */
export function ApiStandardErrorResponses() {
  return applyDecorators(
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
      type: ErrorResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Validation failed or invalid input',
      type: ValidationErrorResponseDto,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      type: ErrorResponseDto,
    }),
  );
}

/**
 * Standard CRUD responses with all common errors
 */
export function ApiStandardResponses<T>(
  successType: Type<T>,
  successDescription: string = 'Operation successful',
  includeCreated: boolean = false,
) {
  if (includeCreated) {
    return applyDecorators(
      ApiCreatedResponseDecorator(successType, successDescription),
      ApiStandardErrorResponses(),
    );
  }
  return applyDecorators(
    ApiSuccessResponse(successType, successDescription),
    ApiStandardErrorResponses(),
  );
}

/**
 * Not found error response
 */
export function ApiNotFoundResponse(description: string = 'Resource not found') {
  return ApiResponse({
    status: 404,
    description,
    type: ErrorResponseDto,
  });
}

/**
 * Forbidden error response
 */
export function ApiForbiddenResponse(description: string = 'Forbidden - Insufficient permissions') {
  return ApiResponse({
    status: 403,
    description,
    type: ErrorResponseDto,
  });
}

