import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { IncomeFrequency } from './complete-onboarding.dto';

export class UpdateOnboardingBasicInfoDto {
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
}
