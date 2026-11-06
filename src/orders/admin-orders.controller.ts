import {
  Controller,
  UseGuards,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Patch,
  Body,
} from '@nestjs/common';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { OrderService } from './orders.service';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('api/v1/admin/orders')
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
export class AdminOrdersController {
  constructor(private readonly orderService: OrderService) {
    console.log('🔥 AdminOrdersController CREATED');
  }

  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    const data = await this.orderService.findAllForAdmin(query);

    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.orderService.findOneForAdmin(id);

    return {
      success: true,
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const data = await this.orderService.updateStatus(id, dto);

    return {
      success: true,
      data,
    };
  }
}
