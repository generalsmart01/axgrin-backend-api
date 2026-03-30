import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsEnum, ValidateNested, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OnboardingIncomeDto {
    @ApiProperty({ description: 'Income source name', example: 'Salary' })
    @IsString()
    source: string;

    @ApiProperty({ description: 'Income amount', example: 500000 })
    @IsNumber()
    @Min(0)
    amount: number;
}

export class OnboardingBudgetDto {
    @ApiProperty({ description: 'Category ID', example: 'uuid-of-category' })
    @IsString()
    categoryId: string;

    @ApiProperty({ description: 'Budget amount', example: 50000 })
    @IsNumber()
    @Min(0)
    amount: number;
}

export enum IncomeFrequency {
    MONTHLY = 'MONTHLY',
    IRREGULAR = 'IRREGULAR',
}

export enum OnboardingStatus {
    INCOMPLETE = 'INCOMPLETE',
    STARTED = 'STARTED',
    COMPLETED = 'COMPLETED',
}

/**
 * DTO for completing the unified onboarding process.
 * This covers Step 2 (Basic Info), Step 3 (Incomes), and Step 4 (Budgets).
 */
export class CompleteOnboardingDto {
    @ApiProperty({ description: 'Preferred currency', default: 'NGN', example: 'NGN' })
    @IsString()
    currency: string;

    @ApiProperty({ description: 'Day of the month when financial cycle starts', default: 1, example: 1 })
    @IsNumber()
    @Min(1)
    @Max(31)
    monthStartDay: number;

    @ApiProperty({ description: 'How frequent income is received', enum: IncomeFrequency, example: IncomeFrequency.MONTHLY })
    @IsEnum(IncomeFrequency)
    incomeFrequency: IncomeFrequency;

    @ApiProperty({ description: 'Initial income sources to setup', type: [OnboardingIncomeDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OnboardingIncomeDto)
    incomes: OnboardingIncomeDto[];

    @ApiProperty({ description: 'Initial category budgets to setup', type: [OnboardingBudgetDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OnboardingBudgetDto)
    budgets?: OnboardingBudgetDto[];
}
