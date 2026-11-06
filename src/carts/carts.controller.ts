import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/users/decorators/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('/api/v1/cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Post('/items')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async create(
    @Body() createCartDto: CreateCartDto,
    @UserInfo() userInfo: User,
  ) {
    const data = await this.cartsService.addItem(userInfo.id, createCartDto);

    return {
      success: true,
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async getCart(@Req() req: Request, @UserInfo() userInfo: User) {
    const data = await this.cartsService.getCart(userInfo.id);

    return {
      success: true,
      data,
    };
  }

  @Patch('/items/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @UserInfo() userInfo: User,
  ) {
    const data = await this.cartsService.updateItem(
      userInfo.id,
      +id,
      updateCartItemDto,
    );

    return {
      success: true,
      data,
    };
  }

  @Delete('/items/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string, @UserInfo() userInfo: User) {
    await this.cartsService.removeItem(userInfo.id, +id);

    return {
      success: true,
      data: null,
    };
  }
}
