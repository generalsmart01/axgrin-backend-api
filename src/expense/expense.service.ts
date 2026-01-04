// src/expense/expense.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        userId,
        amount: dto.amount,
        categoryId: dto.categoryId,
        note: dto.note,
        date: dto.date ?? new Date(),
      },
    });
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100); // Max 100 items per page

    const [data, total] = await Promise.all([
      this.prisma.expense.findMany({
        where: { userId },
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
      this.prisma.expense.count({ where: { userId } }),
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
