// src/reports/reports.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/guards/premium.guard';
import { Premium } from '../common/decorators/premium.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ErrorResponseDto, ValidationErrorResponseDto } from '../common/dto/error-response.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  @Premium()
  @ApiOperation({
    summary: 'Generate a financial report (Premium)',
    description:
      'Generate various types of financial reports in different formats (PDF, Excel, CSV, JSON). Premium feature.',
  })
  @ApiCreatedResponse({
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        downloadUrl: {
          type: 'string',
          example: '/api/reports/download/financial-summary-1234567890.pdf',
        },
        filename: {
          type: 'string',
          example: 'financial-summary-1234567890.pdf',
        },
        format: {
          type: 'string',
          example: 'PDF',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid report type or parameters',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Premium subscription required',
    type: ErrorResponseDto,
  })
  async generateReport(
    @Body() dto: GenerateReportDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: string };
    return this.reportsService.generateReport(user.sub, dto);
  }

  @Get('download/:filename')
  @ApiOperation({
    summary: 'Download generated report',
    description: 'Download a previously generated report file',
  })
  @ApiParam({
    name: 'filename',
    description: 'Report filename',
    type: 'string',
    example: 'financial-summary-1234567890.pdf',
  })
  @ApiOkResponse({
    description: 'Report file download',
  })
  async downloadReport(@Param('filename') filename: string) {
    // In a real implementation, this would serve the actual file
    return {
      message: 'Report download endpoint',
      filename,
      note: 'File serving implementation needed',
    };
  }
}

