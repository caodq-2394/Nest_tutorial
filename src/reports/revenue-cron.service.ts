import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ReportsService } from './reports.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReportsCronService {
  private readonly logger = new Logger(ReportsCronService.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly mailService: MailService,
  ) {}

  @Cron('*/1 * * * *', {
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async sendMonthlyRevenueReport() {
    this.logger.log('Starting monthly revenue report...');

    const now = new Date();

    // Tháng vừa kết thúc
    const reportDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const year = reportDate.getFullYear();

    const month = reportDate.getMonth() + 1;

    const report = await this.reportsService.getMonthlyRevenue(year, month);

    this.logger.log(`Revenue ${month}/${year}: ${report.revenue}`);

    // TODO: lấy email admin
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL is not configured');

      return;
    }

    await this.mailService.sendMonthlyRevenueReport({
      to: adminEmail,
      year,
      month,
      revenue: report.revenue,
      totalOrders: report.totalOrders,
    });

    this.logger.log(`Monthly revenue report sent to ${adminEmail}`);
  }
}
