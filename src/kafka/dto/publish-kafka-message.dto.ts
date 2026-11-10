import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublishKafkaMessageDto {
  @ApiProperty({ example: 'order.created' })
  @IsString()
  @MaxLength(100)
  event!: string;

  @ApiProperty({
    example: { orderId: 42, totalAmount: 350000 },
    description: 'Dữ liệu nghiệp vụ được gửi cùng event.',
  })
  @IsObject()
  payload!: Record<string, unknown>;

  @ApiProperty({ required: false, example: '42' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  key?: string;
}
