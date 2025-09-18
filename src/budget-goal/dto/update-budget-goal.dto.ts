// src/budget/dto/update-budget-goal.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateBudgetGoalDto } from './create-budget-goal.dto';

export class UpdateBudgetGoalDto extends PartialType(CreateBudgetGoalDto) {}
