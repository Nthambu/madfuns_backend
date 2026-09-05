import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(password: string): { access_token: string } {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD env var is not set');
    if (password !== adminPassword) throw new UnauthorizedException('Invalid password');
    return { access_token: this.jwtService.sign({ sub: 'admin', role: 'admin' }) };
  }
}
