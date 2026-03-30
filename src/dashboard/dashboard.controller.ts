import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiSuccessResponse } from '../common/decorators/api-responses.decorator';
import { DashboardSummaryResponseDto } from './dto/dashboard-summary-response.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    @ApiOperation({
        summary: 'Get dashboard summary',
        description: 'Retrieve financial summary for the specified month and year',
    })
    @ApiQuery({ name: 'month', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'year', required: false, type: Number, example: 2024 })
    @ApiSuccessResponse(DashboardSummaryResponseDto, 'Dashboard summary retrieved successfully')
    getSummary(
        @Req() req: Request,
        @Query('month') month?: number,
        @Query('year') year?: number,
    ) {
        const user = req.user as { sub: string };
        return this.dashboardService.getSummary(user.sub, month, year);
    }
}
