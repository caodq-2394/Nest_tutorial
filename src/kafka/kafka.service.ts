import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';

export interface KafkaEvent<TPayload = Record<string, unknown>> {
  event: string;
  payload: TPayload;
  occurredAt: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(KafkaService.name);
  private readonly enabled: boolean;
  private readonly topic: string;
  private readonly kafka?: Kafka;
  private producer?: Producer;
  private consumer?: Consumer;
  private connected = false;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<string>('KAFKA_ENABLED') === 'true';
    this.topic = this.configService.get<string>('KAFKA_TOPIC') ?? 'app.events';

    if (!this.enabled) return;

    const brokers = (this.configService.get<string>('KAFKA_BROKERS') ?? '')
      .split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);

    if (brokers.length === 0) {
      this.logger.error(
        'KAFKA_ENABLED=true nhưng KAFKA_BROKERS chưa được cấu hình.',
      );
      return;
    }

    const config: KafkaConfig = {
      clientId:
        this.configService.get<string>('KAFKA_CLIENT_ID') ??
        'nest-tutorial-api',
      brokers,
      ssl: this.configService.get<string>('KAFKA_SSL') === 'true',
    };

    const username = this.configService.get<string>('KAFKA_SASL_USERNAME');
    const password = this.configService.get<string>('KAFKA_SASL_PASSWORD');
    if (username && password) {
      const mechanism = this.configService.get<string>('KAFKA_SASL_MECHANISM');
      config.sasl =
        mechanism === 'scram-sha-256'
          ? { mechanism: 'scram-sha-256', username, password }
          : mechanism === 'scram-sha-512'
            ? { mechanism: 'scram-sha-512', username, password }
            : { mechanism: 'plain', username, password };
    }

    this.kafka = new Kafka(config);
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({
      groupId:
        this.configService.get<string>('KAFKA_CONSUMER_GROUP') ??
        'nest-tutorial-api',
    });
  }

  async onModuleInit(): Promise<void> {
    if (!this.kafka || !this.producer || !this.consumer) return;

    try {
      await this.producer.connect();
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.topic,
        fromBeginning: false,
      });
      await this.consumer.run({
        eachMessage: ({ message }) => {
          const value = message.value?.toString() ?? '';
          this.logger.log(`Received message on ${this.topic}: ${value}`);
          return Promise.resolve();
        },
      });
      this.connected = true;
      this.logger.log(
        `Kafka connected; publishing and consuming topic "${this.topic}".`,
      );
    } catch (error) {
      // Kafka là integration tùy chọn: app HTTP vẫn phải boot được khi broker down.
      this.logger.error(`Kafka is unavailable: ${this.errorMessage(error)}`);
      await this.disconnect();
    }
  }

  async publish(
    event: string,
    payload: Record<string, unknown>,
    key?: string,
  ): Promise<{ topic: string; event: string }> {
    if (!this.producer || !this.connected) {
      throw new ServiceUnavailableException(
        'Kafka is disabled or unavailable. Check KAFKA_* environment variables.',
      );
    }

    const message: KafkaEvent = {
      event,
      payload,
      occurredAt: new Date().toISOString(),
    };
    await this.producer.send({
      topic: this.topic,
      messages: [{ key, value: JSON.stringify(message) }],
    });
    return { topic: this.topic, event };
  }

  getStatus() {
    return {
      enabled: this.enabled,
      connected: this.connected,
      topic: this.topic,
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.disconnect();
  }

  private async disconnect(): Promise<void> {
    this.connected = false;
    await Promise.allSettled([
      this.consumer?.disconnect() ?? Promise.resolve(),
      this.producer?.disconnect() ?? Promise.resolve(),
    ]);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
