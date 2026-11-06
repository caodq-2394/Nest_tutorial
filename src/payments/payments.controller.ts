import { Body, Controller, Post } from '@nestjs/common';

import { PaymentService } from './payments.service';

import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

@Controller('api/v1/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create')
  async create(@Body() dto: CreatePaymentDto) {
    const data = await this.paymentService.create(dto);

    return {
      success: true,
      data,
    };
  }

  @Post('webhook')
  async webhook(@Body() dto: PaymentWebhookDto) {
    const data = await this.paymentService.handleWebhook(dto);

    return {
      success: true,
      data,
    };
  }
}
