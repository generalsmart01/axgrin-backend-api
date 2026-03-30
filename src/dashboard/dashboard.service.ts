import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getSummary(userId: string, month?: number, year?: number) {
        const now = new Date();
        const targetMonth = month ?? (now.getMonth() + 1);
        const targetYear = year ?? now.getFullYear();

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        const [incomeData, expenseData, categoryData, budgetData] = await Promise.all([
            // Total Income
            this.prisma.income.aggregate({
                where: {
                    userId,
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            // Total Expense
            this.prisma.expense.aggregate({
                where: {
                    userId,
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            // Expense Chart (Grouped by Category)
            this.prisma.expense.groupBy({
                by: ['categoryId'],
                where: {
                    userId,
                    date: { gte: startDate, lte: endDate },
                },
                _sum: { amount: true },
            }),
            // Budget Summary
            this.prisma.budget.findMany({
                where: {
                    userId,
                    month: targetMonth,
                    year: targetYear,
                },
                include: {
                    category: true,
                },
            }),
        ]);

        const totalIncome = incomeData._sum.amount || 0;
        const totalExpense = expenseData._sum.amount || 0;

        // Get all categories to match names/colors for the chart
        const categories = await this.prisma.category.findMany({
            where: { userId },
        });

        const expenseChart = categoryData.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);
            return {
                category: category?.name || 'Uncategorized',
                amount: item._sum.amount || 0,
                color: category?.color || '#cccccc',
            };
        });

        // Compute Budget Summary details
        const budgetSummary = await Promise.all(
            budgetData.map(async (budget) => {
                const spent = await this.prisma.expense.aggregate({
                    where: {
                        userId,
                        categoryId: budget.categoryId,
                        date: { gte: startDate, lte: endDate },
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

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            expenseChart,
            budgetSummary,
        };
    }
}
