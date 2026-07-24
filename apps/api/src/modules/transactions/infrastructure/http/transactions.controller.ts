import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from '../../application/use-cases/check-transaction-status.use-case';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly checkTransactionStatusUseCase: CheckTransactionStatusUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment transaction' })
  @ApiResponse({ status: 201, type: TransactionResponseDto, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid transaction data or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 502, description: 'Payment gateway error' })
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<TransactionResponseDto> {
    const result = await this.createTransactionUseCase.execute(createTransactionDto);
    if (result.isFailure) {
      throw result.getError();
    }
    const transaction = result.getValue();
    return plainToInstance(TransactionResponseDto, transaction, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID and check status' })
  @ApiResponse({ status: 200, type: TransactionResponseDto, description: 'Transaction status retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id') id: string): Promise<TransactionResponseDto> {
    const result = await this.checkTransactionStatusUseCase.execute(id);
    if (result.isFailure) {
      throw result.getError();
    }
    const transaction = result.getValue();
    return plainToInstance(TransactionResponseDto, transaction, { excludeExtraneousValues: true });
  }
}
