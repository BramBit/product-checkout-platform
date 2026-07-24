import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'MacBook Pro 16' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'Supercharged for pros with 36GB RAM' })
  @Expose()
  description: string;

  @ApiProperty({ example: 1499900000 })
  @Expose()
  priceInCents: number;

  @ApiProperty({ example: 10 })
  @Expose()
  stockQuantity: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8' })
  @Expose()
  imageUrl?: string;
}
