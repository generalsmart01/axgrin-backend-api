import { Controller, Post, Body, UseGuards, Req, Get, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';
import { UpdateOnboardingBasicInfoDto } from './dto/update-basic-info.dto';
import { UpdateOnboardingIncomesDto } from './dto/update-incomes.dto';
import { UpdateOnboardingBudgetsDto } from './dto/update-budgets.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ApiStandardErrorResponses, ApiSuccessResponse } from '../common/decorators/api-responses.decorator';
import { MessageResponseDto } from '../common/dto/success-response.dto';

@ApiTags('Onboarding')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('onboarding')
export class OnboardingController {
    constructor(private readonly onboardingService: OnboardingService) { }

    @Get('status')
    @ApiOperation({
        summary: 'Get onboarding status',
        description: 'Returns the users current onboarding status and step.',
    })
    @ApiStandardErrorResponses()
    async getOnboardingStatus(@Req() req: Request) {
        const user = req.user as any;
        return this.onboardingService.getOnboardingStatus(user.sub);
    }

    @Patch('step')
    @ApiOperation({
        summary: 'Update onboarding step',
        description: 'Updates the users current onboarding step to save progress.',
    })
    @ApiBody({ type: UpdateOnboardingStepDto })
    @ApiStandardErrorResponses()
    async updateOnboardingStep(@Req() req: Request, @Body() dto: UpdateOnboardingStepDto) {
        const user = req.user as any;
        return this.onboardingService.updateOnboardingStep(user.sub, dto.step);
    }

    @Post('start')
    @ApiOperation({
        summary: 'Start user onboarding',
        description: 'Marks the onboarding process as started.',
    })
    @ApiSuccessResponse(MessageResponseDto, 'Onboarding started successfully')
    @ApiStandardErrorResponses()
    async startOnboarding(@Req() req: Request) {
        const user = req.user as any;
        return this.onboardingService.startOnboarding(user.sub);
    }

    @Post('basic-info')
    @ApiOperation({
        summary: 'Update basic info (Step 1)',
        description: 'Updates currency, month start day, and income frequency. Sets step to 2.',
    })
    @ApiBody({ type: UpdateOnboardingBasicInfoDto })
    @ApiSuccessResponse(MessageResponseDto, 'Basic info updated successfully')
    @ApiStandardErrorResponses()
    async updateBasicInfo(@Req() req: Request, @Body() dto: UpdateOnboardingBasicInfoDto) {
        const user = req.user as any;
        return this.onboardingService.updateBasicInfo(user.sub, dto);
    }

    @Post('incomes')
    @ApiOperation({
        summary: 'Update incomes (Step 2)',
        description: 'Saves initial income sources. Sets step to 3.',
    })
    @ApiBody({ type: UpdateOnboardingIncomesDto })
    @ApiSuccessResponse(MessageResponseDto, 'Incomes saved successfully')
    @ApiStandardErrorResponses()
    async updateIncomes(@Req() req: Request, @Body() dto: UpdateOnboardingIncomesDto) {
        const user = req.user as any;
        return this.onboardingService.updateIncomes(user.sub, dto);
    }

    @Post('budgets')
    @ApiOperation({
        summary: 'Update budgets (Step 3)',
        description: 'Saves initial category budgets. Marks onboarding as COMPLETED and sets step to 4.',
    })
    @ApiBody({ type: UpdateOnboardingBudgetsDto })
    @ApiSuccessResponse(MessageResponseDto, 'Budgets saved and onboarding completed successfully')
    @ApiStandardErrorResponses()
    async updateBudgets(@Req() req: Request, @Body() dto: UpdateOnboardingBudgetsDto) {
        const user = req.user as any;
        return this.onboardingService.updateBudgets(user.sub, dto);
    }
}
