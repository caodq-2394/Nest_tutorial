import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
  IsInt,
} from 'class-validator';

import { Type } from 'class-transformer';
import { PaymentMethod } from 'src/payments/entities/payment.entity';

export class CreateOrderItemDto {
  @IsInt()
  @Min(1)
  productId!: number;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  recipientName!: string;

  @IsString()
  @IsNotEmpty()
  recipientPhone!: string;

  @IsString()
  @IsNotEmpty()
  shippingAddress!: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
