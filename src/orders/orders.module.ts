import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';

import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';
import { MailModule } from 'src/mail/mail.module';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Payment, User]),
    MailModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, UsersService],
  exports: [OrderService],
})
export class OrdersModule {}
