import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaService } from './kafka.service';

describe('KafkaService', () => {
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;

  beforeEach(() => jest.clearAllMocks());

  it('returns 503 when Kafka is disabled', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) =>
      key === 'KAFKA_ENABLED' ? 'false' : undefined,
    );
    const service = new KafkaService(configService);

    await expect(service.publish('order.created', {})).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('sends the topic, key, and event envelope when connected', async () => {
    (configService.get as jest.Mock).mockImplementation((key: string) =>
      key === 'KAFKA_ENABLED' ? 'false' : undefined,
    );
    const service = new KafkaService(configService);
    const send = jest.fn().mockResolvedValue(undefined);
    Object.assign(service as object, {
      producer: { send },
      connected: true,
    });

    await expect(
      service.publish('order.created', { orderId: 42 }, '42'),
    ).resolves.toEqual({ topic: 'app.events', event: 'order.created' });

    expect(send).toHaveBeenCalledWith({
      topic: 'app.events',
      messages: [
        {
          key: '42',
          value: expect.any(String),
        },
      ],
    });
    expect(JSON.parse(send.mock.calls[0][0].messages[0].value)).toEqual({
      event: 'order.created',
      payload: { orderId: 42 },
      occurredAt: expect.any(String),
    });
  });
});
