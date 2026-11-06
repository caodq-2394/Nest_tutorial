import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      // Thêm toán tử ?? '' để đảm bảo luôn là chuỗi string, không bao giờ bị undefined
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') ?? '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') ?? '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') ?? '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value, // Lưu ý: sửa lại thành emails[0].value vì Google trả về một mảng array
      firstName: name?.givenName || '',
      lastName: name?.familyName || '',
      picture: photos[0]?.value || '',
      accessToken,
    };
    done(null, user);
  }
}
