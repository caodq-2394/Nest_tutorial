import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Order, OrderStatus } from 'src/orders/entities/order.entity';

interface MonthlyRevenueRaw {
  revenue: string | null;
  totalOrders: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async getMonthlyRevenue(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 1);

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.totalAmount), 0)', 'revenue')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.createdAt < :endDate', { endDate })
      .andWhere('order.status != :cancelled', {
        cancelled: OrderStatus.CANCELLED,
      })
      .getRawOne<MonthlyRevenueRaw>();

    return {
      year,
      month,
      revenue: Number(result?.revenue ?? 0),
      totalOrders: Number(result?.totalOrders ?? 0),
    };
  }
}
