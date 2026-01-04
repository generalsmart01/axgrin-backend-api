// src/budget/budget.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { BudgetGoalController } from './budget-goal.controller';
import { BudgetService } from './budget-goal.service';

@Module({
  controllers: [BudgetGoalController],
  providers: [BudgetService, PrismaService],
})
export class BudgetModule {}
