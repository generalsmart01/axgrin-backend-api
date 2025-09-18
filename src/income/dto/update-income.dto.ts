// src/income/dto/update-income.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateIncomeDto } from './create-income.dto';

export class UpdateIncomeDto extends PartialType(CreateIncomeDto) {}
