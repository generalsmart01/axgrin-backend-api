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
  ApiParam,
  ApiBody,
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
import { MessageResponseDto } from '../common/dto/success-response.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Admin - Subscription Configuration')
@ApiBearerAuth('JWT-auth')
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
  @ApiBody({ type: CreateSubscriptionConfigDto })
  @ApiStandardResponses(SubscriptionConfigResponseDto, 'Subscription configuration created/updated successfully', true)
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
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
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getAllConfigs() {
    return this.subscriptionConfigService.getAllConfigs();
  }

  @Get(':plan')
  @ApiOperation({
    summary: 'Get subscription configuration by plan',
    description: 'Retrieve subscription pricing and trial configuration for a specific plan',
  })
  @ApiParam({
    name: 'plan',
    description: 'Subscription plan',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @ApiSuccessResponse(SubscriptionConfigResponseDto, 'Subscription configuration retrieved successfully')
  @ApiNotFoundResponse('Configuration not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
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
  @ApiParam({
    name: 'plan',
    description: 'Subscription plan',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @ApiBody({ type: UpdateSubscriptionConfigDto })
  @ApiSuccessResponse(SubscriptionConfigResponseDto, 'Subscription configuration updated successfully')
  @ApiNotFoundResponse('Configuration not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
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
  @ApiParam({
    name: 'plan',
    description: 'Subscription plan',
    enum: SubscriptionPlan,
    example: SubscriptionPlan.MONTHLY,
  })
  @ApiSuccessResponse(MessageResponseDto, 'Subscription configuration deleted successfully')
  @ApiNotFoundResponse('Configuration not found')
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async deleteConfig(
    @Param('plan', new ParseEnumPipe(SubscriptionPlan)) plan: SubscriptionPlan,
  ) {
    return this.subscriptionConfigService.deleteConfig(plan);
  }
}
