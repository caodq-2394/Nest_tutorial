// src/reports/reports.controller.ts

import { Controller, Get } from '@nestjs/common';
import { ReportsCronService } from './revenue-cron.service';

@Controller('api/v1/reports')
export class ReportsController {
  constructor(private readonly reportsCronService: ReportsCronService) {}

  @Get('test/monthly-email')
  async testMonthlyEmail() {
    await this.reportsCronService.sendMonthlyRevenueReport();

    return {
      success: true,
      message: 'Monthly revenue report email sent',
    };
  }
}
