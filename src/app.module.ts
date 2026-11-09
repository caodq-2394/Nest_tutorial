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
// import { ClientsModule, Transport } from '@nestjs/microservices';

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
        // Đọc biến môi trường tổng hợp từ Railway
        const dbUrl =
          process.env.DATABASE_URL || configService.get<string>('DATABASE_URL');

        // Kiểm tra xem chuỗi URL có hợp lệ không (Phải có ký tự '@' của liên kết mạng nội bộ)
        const isUrlValid = dbUrl && dbUrl.includes('@');

        // 1. 🚀 MÔI TRƯỜNG CHẠY THỰC TẾ TRÊN PRODUCTION (RUNTIME CỦA RAILWAY)
        if (isUrlValid) {
          console.log(
            '===> [RUNTIME] ĐÃ ĐỌC ĐƯỢC URL DATABASE POSTGRES HỢP LỆ. KHỞI CHẠY KẾT NỐI!',
          );
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [User, Product, Category, Cart, CartItem],
            autoLoadEntities: true,
            synchronize: true, // Tự động đồng bộ bảng lên Postgres của Railway
          };
        }

        // 2. 🛠️ TRƯỜNG HỢP ĐANG BUILD DOCKER (BUILD-TIME TRÊN CLOUD)
        // Nếu biến NODE_ENV là production nhưng chuỗi URL chưa nạp hoặc chưa hợp lệ
        if (process.env.NODE_ENV === 'production' || !dbUrl) {
          console.log(
            '===> [BUILD-TIME] ĐANG BUILD DOCKER HOẶC THIẾU BIẾN CLOUD - TRẢ VỀ CẤU HÌNH GIẢ LẬP',
          );
          return {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'placeholder',
            password: 'placeholder',
            database: 'placeholder',
            entities: [User, Product, Category, Cart, CartItem],
            autoLoadEntities: true,
            synchronize: false,
          };
        }

        // 3. 💻 MÔI TRƯỜNG DEV TẠI MÁY LOCAL CỦA BẠN (DÙNG MYSQL)
        console.log('===> [LOCAL] ĐANG CHẠY MYSQL TẠI MÁY CỤC BỘ');
        return {
          type: 'mysql',
          host: configService.get<string>('DB_HOST') || 'localhost',
          port: +configService.get('DB_PORT') || 3306,
          username: configService.get<string>('DB_USERNAME') || 'root',
          password: configService.get<string>('DB_PASSWORD') || '',
          database: configService.get<string>('DB_DATABASE_NAME') || 'test',
          entities: [User, Product, Category, Cart, CartItem],
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    // ClientsModule.register([
    //   {
    //     name: 'KAFKA_SERVICE',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         clientId: 'nest-tutorial',
    //         brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
    //       },
    //       consumer: {
    //         groupId: 'nest-tutorial-consumer',
    //       },
    //     },
    //   },
    // ]),

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
