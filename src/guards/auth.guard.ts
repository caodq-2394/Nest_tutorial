/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/users/decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. ĐƯA LÊN ĐẦU: Kiểm tra cứng URL (Giải pháp chống sập tuyệt đối cho Google Auth)
    // Nếu URL chứa chữ "/google", cho qua luôn, không chạy xuống đoạn tìm User theo ID dưới nữa
    if (
      request.url &&
      (request.url.includes('/google') ||
        request.url.includes('/register') ||
        request.url.includes('/login'))
    ) {
      return true; // Cho qua luôn, không chạy xuống check token hay reflector nữa
    }

    // 2. Sử dụng Reflector cho các API Public khác
    if (this.reflector) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) {
        return true;
      }
    }

    // 3. ĐOẠN CHECK TOKEN CỦA HỆ THỐNG
    const authHeader = request.headers['authorization'];
    // Sửa lại đoạn split để lấy chính xác token từ chuỗi "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new Error('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Đảm bảo payload có id hợp lệ trước khi gọi usersService tìm kiếm trong DB
      if (!payload || !payload.id) {
        throw new Error('Invalid token payload');
      }

      // ĐOẠN QUERY GÂY LỖI TRƯỚC ĐÓ: Nhờ bọc điều kiện trên, payload.id lúc này chắc chắn không bị NaN
      const user = await this.usersService.findOne(+payload.id);
      if (!user) {
        throw new Error('User not found');
      }

      request['user'] = payload;
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new Error('Invalid token');
    }
  }
}
