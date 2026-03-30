import { ApiProperty } from '@nestjs/swagger';

class ExpenseChartData {
    @ApiProperty({ example: 'Food' })
    category: string;

    @ApiProperty({ example: 450.5 })
    amount: number;

    @ApiProperty({ example: '#FF5733' })
    color: string;
}

class BudgetSummary {
    @ApiProperty({ example: 1000 })
    budget: number;

    @ApiProperty({ example: 850 })
    spent: number;

    @ApiProperty({ example: 150 })
    remaining: number;

    @ApiProperty({ example: 85 })
    percentage: number;
}

export class DashboardSummaryResponseDto {
    @ApiProperty({ example: 5000 })
    totalIncome: number;

    @ApiProperty({ example: 2500 })
    totalExpense: number;

    @ApiProperty({ example: 2500 })
    balance: number;

    @ApiProperty({ type: [ExpenseChartData] })
    expenseChart: ExpenseChartData[];

    @ApiProperty({ type: [BudgetSummary] })
    budgetSummary: any[];
}
