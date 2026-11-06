import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';

import { Order, OrderStatus } from './entities/order.entity';

import { OrderItem } from './entities/order-item.entity';

import { Payment, PaymentStatus } from '../payments/entities/payment.entity';

import { Product } from '../products/entities/product.entity';

import { CreateOrderDto } from './dto/create-order.dto';
import { MailService } from 'src/mail/mail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const result = await this.dataSource.transaction(async (manager) => {
      const {
        recipientName,
        recipientPhone,
        shippingAddress,
        paymentMethod,
        items,
      } = createOrderDto;

      if (!items?.length) {
        throw new BadRequestException('Order must have at least one item');
      }

      let totalAmount = 0;

      const orderItems: Partial<OrderItem>[] = [];

      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found`);
        }

        if (item.quantity <= 0) {
          throw new BadRequestException('Quantity must be greater than 0');
        }

        const unitPrice = Number(product.price);

        const subtotal = unitPrice * item.quantity;

        totalAmount += subtotal;

        orderItems.push({
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
          subtotal,
        });
      }

      const orderCode = this.generateOrderCode();

      const order = manager.create(Order, {
        orderCode,
        userId,
        recipientName,
        recipientPhone,
        shippingAddress,
        totalAmount,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await manager.save(Order, order);

      const entities = orderItems.map((item) =>
        manager.create(OrderItem, {
          ...item,
          orderId: savedOrder.id,
        }),
      );

      await manager.save(OrderItem, entities);

      const payment = manager.create(Payment, {
        orderId: savedOrder.id,
        method: paymentMethod,
        amount: totalAmount,
        status: PaymentStatus.PENDING,
        transactionCode: null,
      });

      await manager.save(Payment, payment);

      const result = await manager.findOne(Order, {
        where: {
          id: savedOrder.id,
        },
        relations: ['items', 'payment', 'user'],
      });

      return result;
    });

    // Transaction đã commit thành công

    if (result?.user?.email) {
      try {
        await this.mailService.sendOrderConfirmation({
          to: result.user.email,
          orderCode: result.orderCode,
          recipientName: result.recipientName,
          totalAmount: Number(result.totalAmount),
        });
      } catch (error) {
        this.logger.error(
          `Failed to send order confirmation email for ${result.orderCode}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    return result;
  }

  private generateOrderCode(): string {
    const timestamp = Date.now().toString();

    const random = Math.floor(1000 + Math.random() * 9000).toString();

    return `ORD${timestamp}${random}`;
  }

  async findMyOrders(userId: number) {
    const data = await this.orderRepository.find({
      where: {
        userId,
      },
      relations: ['items', 'payment'],
      order: {
        createdAt: 'DESC',
      },
    });

    return data;
  }

  async findMyOrderDetail(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
      relations: ['items', 'payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getMyOrderStatus(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
      select: ['id', 'orderCode', 'status', 'createdAt', 'updatedAt'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
        userId,
      },
      relations: ['payment'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Order can only be cancelled before admin confirmation',
      );
    }

    order.status = OrderStatus.CANCELLED;

    const savedOrder = await this.orderRepository.save(order);

    return savedOrder;
  }

  async findAllForAdmin(query: OrderQueryDto) {
    const { status, search, page = 1, limit = 20 } = query;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC');

    if (status) {
      qb.andWhere('order.status = :status', {
        status,
      });
    }

    if (search) {
      qb.andWhere(
        `(order.orderCode LIKE :search
        OR order.recipientName LIKE :search
        OR order.recipientPhone LIKE :search)`,
        {
          search: `%${search}%`,
        },
      );
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneForAdmin(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        user: true,
        items: {
          product: {
            images: true,
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    this.validateStatusTransition(order.status, dto.status);

    if (dto.status === OrderStatus.CANCELLED && !dto.rejectReason?.trim()) {
      throw new BadRequestException('Reject reason is required');
    }

    order.status = dto.status;

    return this.orderRepository.save(order);
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    nextStatus: OrderStatus,
  ) {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],

      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],

      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING],

      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],

      [OrderStatus.DELIVERED]: [],

      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      throw new BadRequestException(
        `Cannot change order status from ${currentStatus} to ${nextStatus}`,
      );
    }
  }
}
