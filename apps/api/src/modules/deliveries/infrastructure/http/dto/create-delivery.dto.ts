import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDeliveryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  customerId: string;

  @ApiProperty({ example: 'Calle 123 #45-67' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiPropertyOptional({ example: '110111' })
  @IsString()
  @IsOptional()
  postalCode?: string;
}
