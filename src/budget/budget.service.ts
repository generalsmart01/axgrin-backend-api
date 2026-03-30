import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, dto: CreateBudgetDto) {
    return this.prisma.budget.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  async findOne(userId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto) {
    const budget = await this.findOne(userId, id);
    return this.prisma.budget.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(userId: string, id: string) {
    const budget = await this.findOne(userId, id);
    return this.prisma.budget.delete({
      where: { id },
    });
  }

  async getRemainingBudget(userId: string, categoryId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? (now.getMonth() + 1);
    const targetYear = year ?? now.getFullYear();

    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId,
        month: targetMonth,
        year: targetYear,
      },
    });

    if (!budget) return { message: 'No budget found for this period', remaining: 0, spent: 0, budget: 0 };

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const spent = await this.prisma.expense.aggregate({
      where: {
        userId,
        categoryId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = spent._sum.amount || 0;
    return {
      categoryId,
      budget: budget.amount,
      spent: totalSpent,
      remaining: budget.amount - totalSpent,
    };
  }

  async getBudgetSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month ?? (now.getMonth() + 1);
    const targetYear = year ?? now.getFullYear();

    const budgets = await this.prisma.budget.findMany({
      where: {
        userId,
        month: targetMonth,
        year: targetYear,
      },
      include: {
        category: true,
      },
    });

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const summary = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.prisma.expense.aggregate({
          where: {
            userId,
            categoryId: budget.categoryId,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: { amount: true },
        });

        const totalSpent = spent._sum.amount || 0;

        return {
          categoryId: budget.categoryId,
          categoryName: budget.category.name,
          budget: budget.amount,
          spent: totalSpent,
          remaining: budget.amount - totalSpent,
          percentage: budget.amount > 0 ? Math.round((totalSpent / budget.amount) * 100) : 0,
        };
      }),
    );

    return summary;
  }
}
