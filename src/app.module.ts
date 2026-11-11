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
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    // 1. Đưa ConfigModule lên đầu tiên và bật isGlobal: true để dùng chung cho toàn bộ app
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

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          ...(databaseUrl
            ? { url: databaseUrl }
            : {
                host: configService.get<string>('PGHOST'),
                port: Number(configService.get<string>('PGPORT') ?? 5432),
                username: configService.get<string>('PGUSER'),
                password: configService.get<string>('PGPASSWORD'),
                database: configService.get<string>('PGDATABASE'),
              }),

          entities: [User, Product, Category, Cart, CartItem],
          autoLoadEntities: true,
          // Chỉ dùng synchronize ở local; production nên chạy migration.
          synchronize: configService.get<string>('DB_SYNCHRONIZE') === 'true',
          ssl:
            configService.get<string>('DB_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : false,
        };
      },
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
    KafkaModule,
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
