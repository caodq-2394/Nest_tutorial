import { Module } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { CategoriesService } from 'src/categories/categories.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthGuard } from 'src/guards/auth.guard';
import { UsersModule } from 'src/users/users.module';
import { ProductImage } from 'src/product-image/entities/product-image.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { ProductImageModule } from 'src/product-image/product-image.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { AdminProductsController } from './admin-product.controller';
import { AdminProductsService } from './admin-product.service';
import { ProductsGrpcController } from '../grpc/products.grpc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Category, ProductImage]),
    UsersModule,
    AuthModule,
    CloudinaryModule,
    ProductImageModule,
  ],
  controllers: [
    ProductsController,
    AdminProductsController,
    ProductsGrpcController,
  ],
  providers: [
    ProductsService,
    AdminProductsService,
    UsersService,
    CategoriesService,
    AuthGuard,
    CloudinaryService,
  ],
})
export class ProductsModule {}
