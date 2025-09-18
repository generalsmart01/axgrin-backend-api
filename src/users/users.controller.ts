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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ✅ GET /users - Admins only
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string', nullable: true },
          lastName: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['USER', 'ADMIN'] },
          gender: { type: 'string', enum: ['MALE', 'FEMALE'], nullable: true },
          emailVerified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    type: ErrorResponseDto,
  })
  findAll() {
    return this.usersService.getAllUsers();
  }

  // ✅ GET /users/me - Get current user info (MUST come before /:id)
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  @Get('me')
  async getMe(@Req() req: Request) {
    const user = req.user as any;
    // Use the service to fetch the full user data by id
    return this.usersService.getUserById(user.sub);
  }

  // ✅ GET /users/:id - Admins can access any, others can access only self
  @Get(':id')
  @Roles('ADMIN', 'USER')
  @ApiBearerAuth()
  async getUserById(@Param('id') id: string, @Req() req: Request) {
    const requestingUser = req.user as any;

    if (requestingUser.role !== 'ADMIN' && requestingUser.sub !== id) {
      throw new ForbiddenException('Access denied');
    }

    return this.usersService.getUserById(id);
  }
}
