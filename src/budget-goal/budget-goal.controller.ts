// src/budget/budget.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateBudgetGoalDto } from './dto/create-budget-goal.dto';
import { UpdateBudgetGoalDto } from './dto/update-budget-goal.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BudgetService } from './budget-goal.service';
import { Query } from '@nestjs/common'; // if not yet imported

@ApiTags('Budget')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post()
  create(@Body() dto: CreateBudgetGoalDto, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.create(user.sub, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findAll(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.findOne(user.sub, id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBudgetGoalDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.budgetService.update(user.sub, id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.remove(user.sub, id);
  }

  // 🟡 GET /budget/remaining?categoryId=abc123
  @Get('remaining')
  getRemainingBudget(
    @Req() req: Request,
    @Query('categoryId') categoryId: string,
  ) {
    const user = req.user as { sub: string };
    return this.budgetService.getRemainingBudget(user.sub, categoryId);
  }

  // 🟢 GET /budget/summary
  @Get('summary')
  getBudgetSummary(@Req() req: Request) {
    const user = req.user as { sub: string };
    return this.budgetService.getBudgetSummary(user.sub);
  }
}
