import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/kernel/result';
import { TransactionNotFoundError, PaymentGatewayError } from '../../../../shared/kernel/domain-errors';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity';
import {
  type TransactionRepositoryPort,
  TRANSACTION_REPOSITORY_PORT,
} from '../../domain/ports/transaction-repository.port';
import {
  type ProductRepositoryPort,
  PRODUCT_REPOSITORY_PORT,
} from '../../../catalog/domain/ports/product-repository.port';
import {
  type PaymentGatewayPort,
  PAYMENT_GATEWAY_PORT,
} from '../../domain/ports/payment-gateway.port';

@Injectable()
export class CheckTransactionStatusUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGateway: PaymentGatewayPort,
  ) {}

  async execute(
    transactionId: string,
  ): Promise<Result<Transaction, TransactionNotFoundError | PaymentGatewayError>> {
    const transaction = await this.transactionRepository.findById(transactionId);
    if (!transaction) {
      return Result.fail(new TransactionNotFoundError(`Transaction with id ${transactionId} not found`));
    }

    if (transaction.isFinalStatus()) {
      return Result.ok(transaction);
    }

    if (!transaction.wompiTransactionId) {
      return Result.ok(transaction);
    }

    let statusResult: { status: string; statusDetail: string | null };
    try {
      statusResult = await this.paymentGateway.getTransactionStatus(transaction.wompiTransactionId);
    } catch (error: any) {
      const gatewayError =
        error instanceof PaymentGatewayError
          ? error
          : new PaymentGatewayError(error.message || 'Error getting transaction status');
      return Result.fail(gatewayError);
    }

    const newStatus = statusResult.status as TransactionStatus;
    const updatedTransaction = transaction.withStatus(newStatus, statusResult.statusDetail);
    const savedTransaction = await this.transactionRepository.update(updatedTransaction);

    if (newStatus === 'APPROVED') {
      const product = await this.productRepository.findById(transaction.productId);
      if (product) {
        const updatedProduct = product.decreaseStock(transaction.quantity);
        await this.productRepository.updateStock(product.id, updatedProduct.stockQuantity);
      }
    }

    return Result.ok(savedTransaction);
  }
}
