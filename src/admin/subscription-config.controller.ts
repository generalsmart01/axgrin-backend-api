// src/admin/subscription-config.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionPlan } from '@prisma/client';
import { SubscriptionConfigService } from './subscription-config.service';
import {
  CreateSubscriptionConfigDto,
  UpdateSubscriptionConfigDto,
  SubscriptionConfigResponseDto,
} from './dto/subscription-config.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../common/dto/error-response.dto';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Admin - Subscription Configuration')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin/subscription-config')
export class SubscriptionConfigController {
  constructor(private readonly subscriptionConfigService: SubscriptionConfigService) {}

  @Post()
  @ApiOperation({
    summary: 'Create or update subscription configuration',
    description: 'Create or update subscription pricing and trial configuration for a plan',
  })
  @ApiCreatedResponse({
    description: 'Subscription configuration created/updated successfully',
    type: SubscriptionConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required',
    type: ErrorResponseDto,
  })
  async upsertConfig(@Body() dto: CreateSubscriptionConfigDto) {
    return this.subscriptionConfigService.upsertConfig(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subscription configurations',
    description: 'Retrieve all subscription pricing and trial configurations',
  })
  @ApiOkResponse({
    description: 'Subscription configurations retrieved successfully',
    type: [SubscriptionConfigResponseDto],
  })
  async getAllConfigs() {
    return this.subscriptionConfigService.getAllConfigs();
  }

  @Get(':plan')
  @ApiOperation({
    summary: 'Get subscription configuration by plan',
    description: 'Retrieve subscription pricing and trial configuration for a specific plan',
  })
  @ApiOkResponse({
    description: 'Subscription configuration retrieved successfully',
    type: SubscriptionConfigResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
    type: ErrorResponseDto,
  })
  async getConfigByPlan(
    @Param('plan', new ParseEnumPipe(SubscriptionPlan)) plan: SubscriptionPlan,
  ) {
    return this.subscriptionConfigService.getConfigByPlan(plan);
  }

  @Put(':plan')
  @ApiOperation({
    summary: 'Update subscription configuration',
    description: 'Update subscription pricing, trial days, or other configuration for a plan',
  })
  @ApiOkResponse({
    description: 'Subscription configuration updated successfully',
    type: SubscriptionConfigResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
    type: ErrorResponseDto,
  })
  async updateConfig(
    @Param('plan', new ParseEnumPipe(SubscriptionPlan)) plan: SubscriptionPlan,
    @Body() dto: UpdateSubscriptionConfigDto,
  ) {
    return this.subscriptionConfigService.updateConfig(plan, dto);
  }

  @Delete(':plan')
  @ApiOperation({
    summary: 'Delete subscription configuration',
    description: 'Delete subscription configuration for a plan',
  })
  @ApiOkResponse({
    description: 'Subscription configuration deleted successfully',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration not found',
    type: ErrorResponseDto,
  })
  async deleteConfig(
    @Param('plan', new ParseEnumPipe(SubscriptionPlan)) plan: SubscriptionPlan,
  ) {
    return this.subscriptionConfigService.deleteConfig(plan);
  }
}

