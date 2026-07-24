import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @IsUUID()
  customerId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  @IsUUID()
  deliveryId: string;

  @ApiProperty({ example: 'tok_test_12345' })
  @IsString()
  @IsNotEmpty()
  cardToken: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(36)
  installments: number;

  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  customerEmail: string;
}
