import {
  IsString, IsNotEmpty, IsOptional,
  IsObject, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BillingAddressDto {
  @IsOptional() @IsString() line1?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() postal_code?: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'tkt_1715000000_abc123' })
  @IsString() @IsNotEmpty()
  reference: string;

  @ApiPropertyOptional({ example: '+254 712 345 678' })
  @IsOptional() @IsString()
  customerPhone?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  @ValidateNested() @Type(() => BillingAddressDto)
  billingAddress?: BillingAddressDto;
}
