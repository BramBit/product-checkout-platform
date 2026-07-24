import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TransactionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @Expose()
  productId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @Expose()
  customerId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  @Expose()
  deliveryId: string;

  @ApiProperty({ example: 1 })
  @Expose()
  quantity: number;

  @ApiProperty({ example: 5000000 })
  @Expose()
  productAmountInCents: number;

  @ApiProperty({ example: 500000 })
  @Expose()
  baseFeeInCents: number;

  @ApiProperty({ example: 800000 })
  @Expose()
  deliveryFeeInCents: number;

  @ApiProperty({ example: 6300000 })
  @Expose()
  totalAmountInCents: number;

  @ApiProperty({ example: 'PENDING' })
  @Expose()
  status: string;

  @ApiPropertyOptional({ example: '12345-167890-34567' })
  @Expose()
  wompiTransactionId: string | null;

  @ApiPropertyOptional({ example: 'APPROVED' })
  @Expose()
  wompiStatusDetail: string | null;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
