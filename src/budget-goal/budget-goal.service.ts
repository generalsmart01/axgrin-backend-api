// src/budget/budget.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateBudgetGoalDto } from './dto/create-budget-goal.dto';
import { UpdateBudgetGoalDto } from './dto/update-budget-goal.dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateBudgetGoalDto) {
    return this.prisma.budgetGoal.create({
      data: {
        userId,
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.budgetGoal.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.budgetGoal.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!goal) throw new NotFoundException('Budget goal not found');
    return goal;
  }

  update(userId: string, id: string, dto: UpdateBudgetGoalDto) {
    return this.prisma.budgetGoal.updateMany({
      where: { id, userId },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.budgetGoal.deleteMany({
      where: { id, userId },
    });
  }

  // src/budget/budget.service.ts
  async getRemainingBudget(userId: string, categoryId: string) {
    const goal = await this.prisma.budgetGoal.findFirst({
      where: {
        userId,
        categoryId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!goal) return { message: 'No active budget goal found', remaining: 0 };

    const spent = await this.prisma.expense.aggregate({
      where: {
        userId,
        categoryId,
        date: {
          gte: goal.startDate,
          lte: goal.endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = spent._sum.amount || 0;
    return {
      categoryId,
      target: goal.target,
      spent: totalSpent,
      remaining: goal.target - totalSpent,
    };
  }

  async getBudgetSummary(userId: string) {
    const goals = await this.prisma.budgetGoal.findMany({
      where: {
        userId,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: {
        category: true,
      },
    });

    const summary = await Promise.all(
      goals.map(async (goal) => {
        const spent = await this.prisma.expense.aggregate({
          where: {
            userId,
            categoryId: goal.categoryId,
            date: {
              gte: goal.startDate,
              lte: goal.endDate,
            },
          },
          _sum: { amount: true },
        });

        const totalSpent = spent._sum.amount || 0;

        return {
          categoryId: goal.categoryId,
          categoryName: goal.category.name,
          target: goal.target,
          spent: totalSpent,
          remaining: goal.target - totalSpent,
          startDate: goal.startDate,
          endDate: goal.endDate,
        };
      }),
    );

    return summary;
  }
}
