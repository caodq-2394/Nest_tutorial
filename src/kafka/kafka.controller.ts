import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KafkaService } from './kafka.service';
import { PublishKafkaMessageDto } from './dto/publish-kafka-message.dto';

@ApiTags('kafka')
@ApiBearerAuth()
@Controller('api/v1/kafka')
export class KafkaController {
  constructor(private readonly kafkaService: KafkaService) {}

  @Get('status')
  status() {
    return { success: true, data: this.kafkaService.getStatus() };
  }

  @Post('publish')
  async publish(@Body() dto: PublishKafkaMessageDto) {
    const data = await this.kafkaService.publish(
      dto.event,
      dto.payload,
      dto.key,
    );
    return { success: true, data };
  }
}
