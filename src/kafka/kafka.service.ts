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
  private connecting = false;
  private disconnecting = false;
  private shuttingDown = false;
  private reconnectTimer?: NodeJS.Timeout;

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

    this.producer.on(this.producer.events.DISCONNECT, () => {
      this.handleDisconnect('producer disconnected');
    });
    this.consumer.on(this.consumer.events.DISCONNECT, () => {
      this.handleDisconnect('consumer disconnected');
    });
    this.consumer.on(this.consumer.events.CRASH, ({ payload }) => {
      if (payload.restart) return;

      this.logger.error(
        `Kafka consumer crashed: ${this.errorMessage(payload.error)}`,
      );
      this.handleDisconnect('consumer crashed');
    });
  }

  onModuleInit(): void {
    // Kafka is optional: do not delay HTTP startup while KafkaJS retries.
    void this.connect();
  }

  private async connect(): Promise<void> {
    if (
      !this.kafka ||
      !this.producer ||
      !this.consumer ||
      this.connecting ||
      this.shuttingDown
    ) {
      return;
    }

    this.connecting = true;
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
      this.logger.error(`Kafka is unavailable: ${this.errorMessage(error)}`);
      await this.disconnect();
      this.scheduleReconnect();
    } finally {
      this.connecting = false;
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
    try {
      await this.producer.send({
        topic: this.topic,
        messages: [{ key, value: JSON.stringify(message) }],
      });
    } catch (error) {
      this.logger.error(`Kafka publish failed: ${this.errorMessage(error)}`);
      this.handleDisconnect('producer send failed');
      throw new ServiceUnavailableException('Kafka is unavailable.');
    }
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
    this.shuttingDown = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    await this.disconnect();
  }

  private handleDisconnect(reason: string): void {
    this.connected = false;
    if (this.disconnecting || this.shuttingDown) return;

    this.logger.warn(`Kafka unavailable: ${reason}.`);
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.shuttingDown || this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      void this.reconnect();
    }, 5000);
    this.reconnectTimer.unref();
  }

  private async reconnect(): Promise<void> {
    await this.disconnect();
    await this.connect();
  }

  private async disconnect(): Promise<void> {
    this.connected = false;
    this.disconnecting = true;
    try {
      await Promise.allSettled([
        this.consumer?.disconnect() ?? Promise.resolve(),
        this.producer?.disconnect() ?? Promise.resolve(),
      ]);
    } finally {
      this.disconnecting = false;
    }
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
