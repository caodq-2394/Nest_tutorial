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
        // Đọc trực tiếp từ hệ thống hoặc qua ConfigService
        const dbUrl =
          process.env.DATABASE_URL || configService.get<string>('DATABASE_URL');

        // 1. 🚀 MÔI TRƯỜNG RUNTIME THỰC TẾ TRÊN CLOUD (Có tồn tại biến DATABASE_URL)
        if (dbUrl) {
          console.log(
            '===> [RUNTIME] ĐÃ PHÁT HIỆN DATABASE_URL. TIẾN HÀNH KẾT NỐI POSTGRES PRODUCTION!',
          );
          return {
            type: 'postgres',
            url: dbUrl,
            entities: [User, Product, Category, Cart, CartItem],
            autoLoadEntities: true,
            synchronize: true, // Tự động tạo bảng trên Postgres của Railway [1]
          };
        }

        // 2. 🛠️ MÔI TRƯỜNG DOCKER BUILD HOẶC DEV LOCAL (Khi KHÔNG có biến DATABASE_URL)
        // Nếu đang build trên Cloud, dbUrl sẽ trống -> Trả về cấu hình giả lập để vượt qua bước biên dịch [1]
        if (process.env.NODE_ENV === 'production') {
          console.log(
            '===> [BUILD-TIME] KHÔNG TÌM THẤY URL TRONG BƯỚC BUILD - DÙNG CẤU HÌNH PHỤ TRỢ',
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

        // 3. 💻 MÔI TRƯỜNG DEV TẠI MÁY CỤC BỘ CỦA BẠN (DÙNG MYSQL)
        console.log('===> [LOCAL] ĐANG CHẠY MYSQL TẠI MÁY CỤC BỘ [1]');
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
