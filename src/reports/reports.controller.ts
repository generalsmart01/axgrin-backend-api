import { Controller, Post, Body, UseGuards, Req, Get, Param } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PremiumGuard } from '../common/guards/premium.guard';
import { Premium } from '../common/decorators/premium.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import {
  ApiStandardResponses,
  ApiStandardErrorResponses,
  ApiSuccessResponse,
  ApiForbiddenResponse,
} from '../common/decorators/api-responses.decorator';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PremiumGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post('generate')
  @Premium()
  @ApiOperation({
    summary: 'Generate financial report',
    description:
      'Generate various types of financial reports in different formats (PDF, Excel, CSV, JSON). Premium feature.',
  })
  @ApiBody({ type: GenerateReportDto })
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
          enum: ['PDF', 'EXCEL', 'CSV', 'JSON'],
        },
      },
    },
  })
  @ApiForbiddenResponse('Forbidden - Premium subscription required')
  @ApiStandardErrorResponses()
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
    example: 'financial-summary-1234567890.pdf',
    type: String,
  })
  @ApiOkResponse({
    description: 'Report file download',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        filename: { type: 'string' },
      },
    },
  })
  @ApiStandardErrorResponses()
  async downloadReport(@Param('filename') filename: string) {
    return {
      message: 'Report download endpoint',
      filename,
      note: 'File serving implementation needed',
    };
  }
}
