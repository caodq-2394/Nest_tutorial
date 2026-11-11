import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/users/decorators/roles.decorator';
import { UserRoles } from 'src/users/entities/user.entity';
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
  @UseGuards(RolesGuard)
  @Roles(UserRoles.ADMIN)
  async publish(@Body() dto: PublishKafkaMessageDto) {
    const data = await this.kafkaService.publish(
      dto.event,
      dto.payload,
      dto.key,
    );
    return { success: true, data };
  }
}
