import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserInfo } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';

@Controller('api/v1/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() dto: CreateOrderDto, @UserInfo() userInfo: User) {
    const data = await this.orderService.create(dto, userInfo.id);

    return {
      success: true,
      data,
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  async findMyOrders(@UserInfo() userInfo: User) {
    const data = await this.orderService.findMyOrders(userInfo.id);

    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findMyOrderDetail(
    @UserInfo() userInfo: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.orderService.findMyOrderDetail(id, userInfo.id);

    return {
      success: true,
      data,
    };
  }

  @Get(':id/status')
  @UseGuards(AuthGuard)
  async getMyOrderStatus(
    @UserInfo() userInfo: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.orderService.getMyOrderStatus(id, userInfo.id);

    return {
      success: true,
      data,
    };
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard)
  async cancelOrder(
    @UserInfo() userInfo: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.orderService.cancelOrder(id, userInfo.id);

    return {
      success: true,
      message: 'Order cancelled successfully',
      data,
    };
  }
}
