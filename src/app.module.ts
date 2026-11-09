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
        console.log(
          '===> [PRODUCTION] KẾT NỐI POSTGRES QUA THÔNG SỐ TƯỜNG MINH!',
        );
        return {
          type: 'postgres',
          // Hãy điền chính xác thông tin lấy từ tab Variables của service Postgres trên Railway vào đây:
          host: 'postgres.railway.internal', // Hoặc domain proxy công khai của bạn ví dụ: maglev.proxy.rlwy.net
          port: 5432, // Đổi thành số cổng thật của bạn nếu dùng Public (ví dụ 12345)
          username: 'postgres',
          password: 'AblXwvicJOSLydmMorjaUubRsfOBYCVS',
          database: 'railway',

          entities: [User, Product, Category, Cart, CartItem],
          autoLoadEntities: true,
          synchronize: true, // Tự động tạo bảng dữ liệu trên Cloud
          ssl: {
            rejectUnauthorized: false, // Bắt buộc để kết nối qua môi trường mạng an toàn
          },
        };
      },

      // Run on local with MySQL
      // useFactory: (configService: ConfigService) => ({
      //   type: 'mysql',
      //   host: configService.get('DB_HOST'),
      //   port: +configService.get('DB_PORT'),
      //   username: configService.get('DB_USERNAME'),
      //   password: configService.get('DB_PASSWORD'),
      //   database: configService.get('DB_DATABASE_NAME'),
      //   entities: [User, Product, Category, Cart, CartItem],
      //   // entities: ['src/**/*.entity.ts'],
      //   autoLoadEntities: true,
      //   synchronize: false,
      // }),
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
