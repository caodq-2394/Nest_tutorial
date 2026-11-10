import { status } from '@grpc/grpc-js';
import { RpcException } from '@nestjs/microservices';
import { ProductsService } from '../products/products.service';
import { ProductsGrpcController } from './products.grpc.controller';

describe('ProductsGrpcController', () => {
  let controller: ProductsGrpcController;
  let productsService: jest.Mocked<
    Pick<ProductsService, 'findOne' | 'findFeatured'>
  >;

  beforeEach(() => {
    productsService = {
      findOne: jest.fn(),
      findFeatured: jest.fn(),
    };
    controller = new ProductsGrpcController(
      productsService as unknown as ProductsService,
    );
  });

  it('returns a product in the gRPC response shape', async () => {
    const product = {
      id: 12,
      name: 'Desk lamp',
      description: 'Adjustable lamp',
      price: 39.5,
      stock: 4,
      isActive: true,
      isFeatured: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      categoryId: 3,
      images: [{ imageUrl: 'https://example.test/lamp.png' }],
    };
    productsService.findOne.mockResolvedValue(product as never);

    await expect(controller.getProduct({ id: 12 })).resolves.toEqual({
      id: 12,
      name: 'Desk lamp',
      description: 'Adjustable lamp',
      price: 39.5,
      stock: 4,
      isActive: true,
      isFeatured: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      categoryId: 3,
      mainImage: 'https://example.test/lamp.png',
    });
  });

  it('returns gRPC NOT_FOUND when the product does not exist', async () => {
    productsService.findOne.mockResolvedValue(null);

    try {
      await controller.getProduct({ id: 404 });
      fail('Expected a not-found exception');
    } catch (error) {
      expect(error).toBeInstanceOf(RpcException);
      expect((error as RpcException).getError()).toEqual({
        code: status.NOT_FOUND,
        message: 'Product 404 was not found',
      });
    }
  });

  it('returns featured products as a list', async () => {
    productsService.findFeatured.mockResolvedValue([
      {
        id: 7,
        name: 'Featured item',
        description: 'A featured item',
        price: 10,
        stock: 2,
        isActive: true,
        isFeatured: true,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
        updatedAt: new Date('2026-02-01T00:00:00.000Z'),
        categoryId: 1,
        mainImage: null,
      } as never,
    ]);

    await expect(controller.listFeaturedProducts()).resolves.toMatchObject({
      items: [{ id: 7, mainImage: '' }],
    });
  });
});
