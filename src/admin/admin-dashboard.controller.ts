// src/admin/admin-dashboard.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminDashboardDto } from './dto/admin-dashboard.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Admin Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get admin dashboard statistics',
    description:
      'Get comprehensive dashboard statistics including main page stats, user statistics, and customer care statistics. Admin only.',
  })
  @ApiOkResponse({
    description: 'Dashboard statistics retrieved successfully',
    type: AdminDashboardDto,
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
  async getAdminDashboard(@Req() req: Request): Promise<AdminDashboardDto> {
    return this.adminDashboardService.getAdminDashboard();
  }

  @Get('main-page')
  @ApiOperation({
    summary: 'Get main page statistics',
    description: 'Get main dashboard page statistics (total users, transactions, etc.)',
  })
  @ApiOkResponse({
    description: 'Main page statistics retrieved successfully',
  })
  async getMainPageStatistics(@Req() req: Request) {
    const dashboard = await this.adminDashboardService.getAdminDashboard();
    return dashboard.mainPage;
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get user statistics',
    description: 'Get detailed user statistics (by role, verification status, etc.)',
  })
  @ApiOkResponse({
    description: 'User statistics retrieved successfully',
  })
  async getUserStatistics(@Req() req: Request) {
    const dashboard = await this.adminDashboardService.getAdminDashboard();
    return dashboard.users;
  }

  @Get('customer-care')
  @ApiOperation({
    summary: 'Get customer care statistics',
    description: 'Get customer care team statistics and activity metrics',
  })
  @ApiOkResponse({
    description: 'Customer care statistics retrieved successfully',
  })
  async getCustomerCareStatistics(@Req() req: Request) {
    const dashboard = await this.adminDashboardService.getAdminDashboard();
    return dashboard.customerCare;
  }
}

