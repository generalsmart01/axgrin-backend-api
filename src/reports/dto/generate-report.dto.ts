// src/reports/dto/generate-report.dto.ts
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  EXPENSES = 'EXPENSES',
  INCOME = 'INCOME',
  BUDGET = 'BUDGET',
  FINANCIAL_SUMMARY = 'FINANCIAL_SUMMARY',
  CATEGORY_BREAKDOWN = 'CATEGORY_BREAKDOWN',
  MONTHLY_REPORT = 'MONTHLY_REPORT',
  ACTIVITY_LOG = 'ACTIVITY_LOG',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON',
}

export class GenerateReportDto {
  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.FINANCIAL_SUMMARY,
  })
  @IsEnum(ReportType)
  reportType: ReportType;

  @ApiProperty({
    description: 'Format of the report',
    enum: ReportFormat,
    example: ReportFormat.PDF,
  })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiPropertyOptional({
    description: 'Start date for the report (ISO 8601 format)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the report (ISO 8601 format)',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Include charts and graphs in the report',
    example: true,
    default: false,
  })
  @IsOptional()
  includeCharts?: boolean;
}

