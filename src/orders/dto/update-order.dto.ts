import { IsEnum, IsString, ValidateIf } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @ValidateIf((o) => o.status === OrderStatus.CANCELLED)
  @IsString()
  rejectReason?: string;
}
