// src/income/income.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, dto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        userId,
        ...dto,
      },
    });
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
      this.prisma.income.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.income.count({ where }),
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
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income || income.userId !== userId)
      throw new ForbiddenException('Access denied');
    return income;
  }

  async update(userId: string, id: string, dto: UpdateIncomeDto) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income || income.userId !== userId)
      throw new ForbiddenException('Access denied');
    return this.prisma.income.update({
      where: { id },
      data: dto,
    });
  }

  async remove(userId: string, id: string) {
    const income = await this.prisma.income.findUnique({ where: { id } });
    if (!income || income.userId !== userId)
      throw new ForbiddenException('Access denied');
    return this.prisma.income.delete({ where: { id } });
  }
}
