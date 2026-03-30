import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OnboardingIncomeDto } from './complete-onboarding.dto';

export class UpdateOnboardingIncomesDto {
    @ApiProperty({ description: 'Income sources to setup', type: [OnboardingIncomeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OnboardingIncomeDto)
    incomes: OnboardingIncomeDto[];
}
