import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingBudgetDto } from './complete-onboarding.dto';

export class UpdateOnboardingBudgetsDto {
    @ApiProperty({ description: 'Category budgets to setup', type: [OnboardingBudgetDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OnboardingBudgetDto)
    budgets: OnboardingBudgetDto[];
}
