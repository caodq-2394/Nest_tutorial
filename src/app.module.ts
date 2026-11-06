import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { CartsModule } from './carts/carts.module';
import { Cart } from './carts/entities/cart.entity';
import { CartItem } from './carts/entities/cart-item.entity';
import { User } from './users/entities/user.entity';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { ProductImageModule } from './product-image/product-image.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsModule } from './reports/reports.module';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        I18nModule.forRoot({
          fallbackLanguage: 'en',

          loaderOptions: {
            path: join(__dirname, 'i18n'),
            watch: true,
          },

          resolvers: [
            {
              use: QueryResolver,
              options: ['lang'],
            },
            AcceptLanguageResolver,
          ],
        }),
      ],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE_NAME'),
        entities: [User, Product, Category, Cart, CartItem],
        // entities: ['src/**/*.entity.ts'],
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    ProductsModule,
    CategoriesModule,
    CartsModule,
    ProductImageModule,
    OrdersModule,
    PaymentsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
