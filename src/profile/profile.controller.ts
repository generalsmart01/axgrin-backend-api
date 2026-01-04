import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';
import { ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @Roles('ADMIN', 'USER', 'PREMIUM', 'VIEWER')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the authenticated user\'s profile with complete information including statistics',
  })
  @ApiSuccessResponse(ProfileResponseDto, 'Profile retrieved successfully')
  @ApiForbiddenResponse('Forbidden - Insufficient permissions')
  @ApiStandardErrorResponses()
  async getMyProfile(@Req() req: Request): Promise<ProfileResponseDto> {
    const user = req.user as { sub: string };
    return this.profileService.getProfile(user.sub);
  }

  @Patch('me')
  @Roles('ADMIN', 'USER', 'PREMIUM')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the authenticated user\'s profile information',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiStandardResponses(ProfileResponseDto, 'Profile updated successfully')
  @ApiForbiddenResponse('Forbidden - Insufficient permissions')
  @ApiStandardErrorResponses()
  async updateMyProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    const user = req.user as { sub: string };
    return this.profileService.updateProfile(user.sub, dto);
  }

  @Get('all')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get all user profiles',
    description: 'Retrieve all user profiles in the system. Available only to Admins.',
  })
  @ApiOkResponse({
    description: 'All profiles retrieved successfully',
    type: [ProfileResponseDto],
  })
  @ApiForbiddenResponse('Forbidden - Admin access required')
  @ApiStandardErrorResponses()
  async getAllProfiles(): Promise<ProfileResponseDto[]> {
    return this.profileService.getAllProfiles();
  }
}
