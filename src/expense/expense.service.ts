import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ExpenseService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) { }

  async create(userId: string, dto: CreateExpenseDto) {
    const expense = await this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        categoryId: dto.categoryId,
        note: dto.note,
        date: dto.date ?? new Date(),
      },
      include: {
        category: true,
      },
    });

    // Budget Check Logic
    const date = new Date(expense.date);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const budget = await this.prisma.budget.findFirst({
      where: {
        userId,
        categoryId: dto.categoryId,
        month,
        year,
      },
    });

    if (budget) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const aggregate = await this.prisma.expense.aggregate({
        where: {
          userId,
          categoryId: dto.categoryId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const totalSpent = aggregate._sum.amount || 0;
      const percentage = (totalSpent / budget.amount) * 100;

      if (totalSpent > budget.amount) {
        await this.notificationService.sendBudgetExceededNotification(
          userId,
          expense.category.name,
          totalSpent,
          budget.amount,
        );
      } else if (percentage >= 80) {
        await this.notificationService.sendBudgetAlertNotification(
          userId,
          expense.category.name,
          totalSpent,
          budget.amount,
        );
      }
    }

    return expense;
  }

  async findAll(userId: string, page: number = 1, limit: number = 20, month?: number, year?: number) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: any = { userId };
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasNextPage: page * take < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(userId, id);
    return this.prisma.expense.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(userId: string, id: string) {
    const expense = await this.findOne(userId, id);
    return this.prisma.expense.delete({ where: { id } });
  }
}
