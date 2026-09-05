import {
  IsString, IsNotEmpty, IsOptional, IsDateString, IsUrl,
  IsArray, ValidateNested, IsNumber, IsPositive, Min, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TicketTypeDto {
  @ApiProperty({ example: 'General Admission' })
  @IsString() @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 25.00 })
  @IsNumber() @IsPositive()
  price: number;

  @ApiProperty({ example: 200 })
  @IsNumber() @Min(1)
  available: number;

  @ApiPropertyOptional({ example: 'Standing room on the floor' })
  @IsOptional() @IsString()
  description?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: 'Summer Rooftop Party' })
  @IsString() @IsNotEmpty() @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Skyline Lounge' })
  @IsOptional() @IsString() @MaxLength(255)
  venue?: string;

  @ApiPropertyOptional({ example: 'Chicago' })
  @IsOptional() @IsString() @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'IL' })
  @IsOptional() @IsString() @MaxLength(50)
  state?: string;

  @ApiProperty({ example: '2025-08-15T20:00:00Z' })
  @IsDateString()
  event_date: string;

  @ApiProperty({ type: [TicketTypeDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => TicketTypeDto)
  ticket_types: TicketTypeDto[];

  @ApiPropertyOptional({ example: 'https://facebook.com/events/123456' })
  @IsOptional() @IsUrl()
  facebook_url?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  image_url?: string;
}
