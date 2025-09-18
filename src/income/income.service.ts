// src/income/income.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateIncomeDto) {
    return this.prisma.income.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.income.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
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
