import {
  Controller,
  Get,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  ApiStandardErrorResponses,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all users in the system. Available only to Admins.',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'clx1234567890abcdef' },
          email: { type: 'string', example: 'user@example.com' },
          firstName: { type: 'string', nullable: true, example: 'John' },
          lastName: { type: 'string', nullable: true, example: 'Doe' },
          role: { type: 'string', enum: ['USER', 'ADMIN', 'PREMIUM', 'VIEWER', 'CUSTOMER_CARE'] },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], nullable: true },
          emailVerified: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  findAll() {
    return this.usersService.getAllUsers();
  }

  @Get('me')
  @Roles('ADMIN', 'USER', 'PREMIUM', 'VIEWER')
  @ApiOperation({
    summary: 'Get current user',
    description: 'Retrieve the authenticated user\'s information',
  })
  @ApiOkResponse({
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string', nullable: true },
        lastName: { type: 'string', nullable: true },
        role: { type: 'string' },
      },
    },
  })
  @ApiStandardErrorResponses()
  async getMe(@Req() req: Request) {
    const user = req.user as any;
    return this.usersService.getUserById(user.sub);
  }

  @Get(':id')
  @Roles('ADMIN', 'USER', 'PREMIUM', 'VIEWER')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by ID. Users can only access their own data unless they are Admins.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clx1234567890abcdef',
    type: String,
  })
  @ApiOkResponse({
    description: 'User information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string', nullable: true },
        lastName: { type: 'string', nullable: true },
        role: { type: 'string' },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Cannot access other users\' data')
  @ApiStandardErrorResponses()
  async getUserById(@Param('id') id: string, @Req() req: Request) {
    const requestingUser = req.user as any;

    if (requestingUser.role !== 'ADMIN' && requestingUser.sub !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.usersService.getUserById(id);
  }
}
