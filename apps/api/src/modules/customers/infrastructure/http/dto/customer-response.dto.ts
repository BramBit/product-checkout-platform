import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CustomerResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Expose()
  email: string;

  @ApiProperty({ example: '+573001234567' })
  @Expose()
  phone: string;

  @ApiProperty({ example: '1234567890' })
  @Expose()
  documentId: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  @Expose()
  createdAt: Date;
}
