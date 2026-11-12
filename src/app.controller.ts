import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './users/decorators/public.decorator';
// import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Lightweight liveness endpoint for Railway and other deployment checks.
   * It deliberately does not query external dependencies.
   */
  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // 1. Endpoint HTTP dùng để bắn thử sự kiện lên Kafka
  // @Get('publish')
  // testPublish() {
  //   this.kafkaClient.emit('user-registered', {
  //     email: 'test-kafka@gmail.com',
  //     status: 'Success',
  //   });
  //   return { message: 'Đã bắn sự kiện sang Kafka thành công!' };
  // }

  // // 2. Hàm chạy ngầm tự động hứng sự kiện từ Kafka về xử lý
  // @EventPattern('user-registered')
  // handleUserRegistered(@Payload() message: any) {
  //   console.log('--- KHẨN CẤP: Nhận được tin nhắn từ Kafka Broker: ', message);
  // }
}
