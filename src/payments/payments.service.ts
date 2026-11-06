import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';

import { Order, OrderStatus } from '../orders/entities/order.entity';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(dto: CreatePaymentDto) {
    const order = await this.dataSource.getRepository(Order).findOne({
      where: {
        id: dto.orderId,
      },
      relations: ['payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order has been cancelled');
    }

    if (order.payment?.status === PaymentStatus.PAID) {
      throw new BadRequestException('Order has already been paid');
    }

    if (dto.method === PaymentMethod.COD) {
      throw new BadRequestException('COD does not require payment creation');
    }

    return this.dataSource.transaction(async (manager) => {
      let payment = order.payment;

      if (!payment) {
        payment = manager.create(Payment, {
          orderId: order.id,
          method: dto.method,
          amount: order.totalAmount,
          status: PaymentStatus.PENDING,
        });
      } else {
        payment.method = dto.method;
        payment.amount = order.totalAmount;
        payment.status = PaymentStatus.PENDING;
      }

      payment.transactionCode = this.generateTransactionCode();

      const savedPayment = await manager.save(Payment, payment);

      return {
        paymentId: savedPayment.id,
        orderId: order.id,
        orderCode: order.orderCode,
        method: savedPayment.method,
        amount: savedPayment.amount,
        status: savedPayment.status,
        transactionCode: savedPayment.transactionCode,
      };
    });
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    const payment = await this.paymentRepository.findOne({
      where: {
        transactionCode: dto.transactionCode,
      },
      relations: ['order'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.PAID) {
      return payment;
    }

    if (Number(payment.amount) !== Number(dto.amount)) {
      throw new BadRequestException('Invalid payment amount');
    }

    if (dto.status !== 'SUCCESS') {
      throw new BadRequestException('Payment was not successful');
    }

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();

    await this.paymentRepository.save(payment);

    payment.order.status = OrderStatus.CONFIRMED;

    await this.orderRepository.save(payment.order);

    return payment;
  }

  // async handleWebhook(dto: PaymentWebhookDto) {
  //   return this.dataSource.transaction(async (manager) => {
  //     const payment = await manager.findOne(Payment, {
  //       where: {
  //         transactionCode: dto.transactionCode,
  //       },
  //       relations: ['order'],
  //     });

  //     if (!payment) {
  //       throw new NotFoundException('Payment not found');
  //     }

  //     // 1. Verify signature
  //     await this.verifyWebhook(dto);

  //     // 2. Verify amount
  //     if (Number(payment.amount) !== Number(dto.amount)) {
  //       throw new BadRequestException('Invalid payment amount');
  //     }

  //     // 3. Idempotent
  //     if (payment.status === PaymentStatus.PAID) {
  //       return {
  //         paymentId: payment.id,
  //         orderId: payment.orderId,
  //         transactionCode: payment.transactionCode,
  //         paymentStatus: payment.status,
  //         paidAt: payment.paidAt,
  //       };
  //     }

  //     // 4. Update payment
  //     payment.status = dto.paymentStatus;

  //     if (dto.paymentStatus === PaymentStatus.PAID) {
  //       payment.paidAt = new Date(dto.paidAt);
  //     }

  //     await manager.save(Payment, payment);

  //     // 5. Update order
  //     if (dto.paymentStatus === PaymentStatus.PAID) {
  //       payment.order.status = OrderStatus.CONFIRMED;

  //       await manager.save(Order, payment.order);
  //     }

  //     return {
  //       paymentId: payment.id,
  //       orderId: payment.orderId,
  //       transactionCode: payment.transactionCode,
  //       paymentStatus: payment.status,
  //       paidAt: payment.paidAt,
  //     };
  //   });
  // }

  private verifyWebhook(dto: PaymentWebhookDto) {
    /**
     * TODO:
     * Verify signature từ VNPay/MoMo/
     * payment provider thực tế.
     */

    if (!dto.signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    return true;
  }

  private generateTransactionCode() {
    const timestamp = Date.now().toString();

    const random = Math.floor(1000 + Math.random() * 9000).toString();

    return `PAY${timestamp}${random}`;
  }
}
