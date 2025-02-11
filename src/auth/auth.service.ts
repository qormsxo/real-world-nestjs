import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JsonWebTokenError } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  // JWT 토큰을 검증하는 메서드
  async verifyToken(token: string) {
    try {
      return await this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      throw error;
    }
  }

  // Authorization 헤더에서 토큰을 추출하는 메서드
  extractTokenFromHeader(authorizationHeader: string): string | null {
    if (authorizationHeader && authorizationHeader.startsWith('Token ')) {
      return authorizationHeader.split(' ')[1];
    }
    return null;
  }
}
