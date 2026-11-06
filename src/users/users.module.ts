import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy } from 'google.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        signOptions: {
          expiresIn: '7d',
        },
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),

    TypeOrmModule.forFeature([User]),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, GoogleStrategy],
  exports: [UsersService, JwtModule],
})
export class UsersModule {}
