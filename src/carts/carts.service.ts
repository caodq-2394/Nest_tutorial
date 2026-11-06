import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from 'src/products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async getCart(userId: number) {
    const cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        items: {
          product: true,
        },
      },
    });

    if (!cart) {
      return {
        id: null,
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
      };
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        stock: item.product.stock,
      },
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    return {
      id: cart.id,
      items,
      totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
      totalAmount: items.reduce((total, item) => total + item.subtotal, 0),
    };
  }

  async addItem(userId: number, dto: CreateCartDto) {
    const product = await this.productRepository.findOne({
      where: {
        id: dto.productId,
        isActive: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.quantity > product.stock) {
      throw new BadRequestException('Quantity exceeds available stock');
    }

    let cart = await this.cartRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
    });

    if (!cart) {
      cart = this.cartRepository.create({
        user: {
          id: userId,
        },
      });

      await this.cartRepository.save(cart);
    }

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.id,
        productId: product.id,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + dto.quantity;

      if (newQuantity > product.stock) {
        throw new BadRequestException('Quantity exceeds available stock');
      }

      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId: product.id,
        quantity: dto.quantity,
      });
    }

    await this.cartItemRepository.save(cartItem);

    return {
      id: cartItem.id,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
      },
      quantity: cartItem.quantity,
      subtotal: product.price * cartItem.quantity,
    };
  }

  async updateItem(userId: number, itemId: number, dto: UpdateCartItemDto) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          user: {
            id: userId,
          },
        },
      },
      relations: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > cartItem.product.stock) {
      throw new BadRequestException('Quantity exceeds available stock');
    }

    cartItem.quantity = dto.quantity;

    await this.cartItemRepository.save(cartItem);

    return {
      id: cartItem.id,
      productId: cartItem.product.id,
      quantity: cartItem.quantity,
      subtotal: cartItem.product.price * cartItem.quantity,
    };
  }

  async removeItem(userId: number, itemId: number) {
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: itemId,
        cart: {
          user: {
            id: userId,
          },
        },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    return await this.cartItemRepository.remove(cartItem);
  }
}
