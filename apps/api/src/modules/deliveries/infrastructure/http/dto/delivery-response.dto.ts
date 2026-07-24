import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DeliveryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  customerId: string;

  @ApiProperty({ example: 'Calle 123 #45-67' })
  @Expose()
  address: string;

  @ApiProperty({ example: 'Bogotá' })
  @Expose()
  city: string;

  @ApiProperty({ example: 'Cundinamarca' })
  @Expose()
  region: string;

  @ApiPropertyOptional({ example: '110111' })
  @Expose()
  postalCode?: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
