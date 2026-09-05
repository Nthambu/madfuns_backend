import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto }    from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login — returns JWT valid for 7 days' })
  @ApiResponse({ status: 200, description: '{ access_token }' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.password);
  }
}
