import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtUtilService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  decodeToken(token: string): any {
    return this.jwtService.decode(token);
  }
}
