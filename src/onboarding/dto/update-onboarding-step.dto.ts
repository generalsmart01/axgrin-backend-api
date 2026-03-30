import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateOnboardingStepDto {
    @ApiProperty({ description: 'The current step of the onboarding process', example: 2 })
    @IsNumber()
    @Min(1)
    step: number;
}
