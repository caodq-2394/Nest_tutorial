import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentStatus } from '../entities/payment.entity';

export class PaymentWebhookDto {
  @IsString()
  @IsNotEmpty()
  transactionCode!: string;

  @IsEnum(PaymentStatus)
  paymentStatus!: PaymentStatus;

  @IsNumber()
  amount!: number;

  @IsDateString()
  paidAt!: string;

  @IsString()
  signature!: string;

  @IsString()
  status?: string;
}
