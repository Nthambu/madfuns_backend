import {
  IsUUID, IsInt, IsPositive, Min, Max,
  IsEmail, IsString, IsNotEmpty, IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InitializePaymentDto {
  @ApiProperty({ example: 'uuid-of-event' })
  @IsUUID()
  eventId: string;

  @ApiProperty({ example: 0, description: 'Index into event.ticket_types array' })
  @IsInt() @Min(0)
  ticketTypeIndex: number;

  @ApiProperty({ example: 2 })
  @IsInt() @IsPositive() @Max(20)
  quantity: number;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  customerEmail: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString() @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ example: '+254 712 345 678' })
  @IsOptional() @IsString()
  customerPhone?: string;
}
