import { status } from '@grpc/grpc-js';
import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { Public } from '../users/decorators/public.decorator';
import { ProductsService } from '../products/products.service';

@Controller()
@Public()
export class ProductsGrpcController {
  constructor(private readonly productsService: ProductsService) {}

  @GrpcMethod('ProductCatalog', 'GetProduct')
  async getProduct(request: { id: number }) {
    const product = await this.productsService.findOne(Number(request.id));

    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: `Product ${request.id} was not found`,
      });
    }

    return this.toGrpcProduct(product);
  }

  @GrpcMethod('ProductCatalog', 'ListFeaturedProducts')
  async listFeaturedProducts() {
    const products = await this.productsService.findFeatured();
    return { items: products.map((product) => this.toGrpcProduct(product)) };
  }

  private toGrpcProduct(product: {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    isActive: boolean;
    isFeatured: boolean;
    createdAt: Date;
    updatedAt: Date;
    categoryId: number;
    mainImage?: string | null;
  }) {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      categoryId: product.categoryId,
      mainImage: product.mainImage ?? '',
    };
  }
}
