import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'your-admin-password' })
  @IsString() @IsNotEmpty()
  password: string;
}
