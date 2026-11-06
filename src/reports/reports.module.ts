import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';

import { MailModule } from 'src/mail/mail.module';
import { ReportsCronService } from './revenue-cron.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User]), MailModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsCronService],
  exports: [ReportsService],
})
export class ReportsModule {}
