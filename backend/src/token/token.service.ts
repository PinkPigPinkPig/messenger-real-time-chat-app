import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class TokenService {
  constructor(private configService: ConfigService) {}

  extractToken(connectionParams: any): string | null {
    return connectionParams?.token || null;
  }

  validateToken(token: string) {
    const refreshTokenSecret = this.configService.get<string>('REFRESH_TOKEN_SECRET');
    try {
        return verify(token, refreshTokenSecret);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return null;
    }
  }
}
