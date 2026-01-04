import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsResponseDto } from './dto/settings-response.dto';
import { Request } from 'express';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiNotFoundResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user settings',
    description: 'Retrieve the authenticated user\'s settings including currency and theme preferences',
  })
  @ApiSuccessResponse(SettingsResponseDto, 'Settings retrieved successfully')
  @ApiNotFoundResponse('Settings not found')
  @ApiStandardErrorResponses()
  getSettings(@Req() req: Request) {
    const user = req.user as any;
    return this.settingsService.getSettings(user.sub);
  }

  @Patch()
  @ApiOperation({
    summary: 'Update user settings',
    description: 'Update the authenticated user\'s settings including currency and theme preferences',
  })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiStandardResponses(SettingsResponseDto, 'Settings updated successfully')
  @ApiStandardErrorResponses()
  updateSettings(@Req() req: Request, @Body() dto: UpdateSettingsDto) {
    const user = req.user as any;
    return this.settingsService.updateSettings(user.sub, dto);
  }
}
