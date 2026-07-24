import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { Result } from '../../../../shared/kernel/result';
import {
  ProductNotFoundError,
  InsufficientStockError,
  InvalidTransactionDataError,
  PaymentGatewayError,
} from '../../../../shared/kernel/domain-errors';
import { Transaction } from '../../domain/entities/transaction.entity';
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

export interface CreateTransactionInput {
  productId: string;
  quantity: number;
  customerId: string;
  deliveryId: string;
  cardToken: string;
  installments: number;
  customerEmail: string;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_PORT)
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PAYMENT_GATEWAY_PORT)
    private readonly paymentGateway: PaymentGatewayPort,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    input: CreateTransactionInput,
  ): Promise<
    Result<
      Transaction,
      ProductNotFoundError | InsufficientStockError | InvalidTransactionDataError | PaymentGatewayError
    >
  > {
    if (!input.quantity || input.quantity <= 0) {
      return Result.fail(new InvalidTransactionDataError('Quantity must be greater than 0'));
    }

    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return Result.fail(new ProductNotFoundError(`Product with id ${input.productId} not found`));
    }

    if (!product.hasEnoughStock(input.quantity)) {
      return Result.fail(
        new InsufficientStockError(
          `Insufficient stock for product ${input.productId}. Available: ${product.stockQuantity}, requested: ${input.quantity}`,
        ),
      );
    }

    const productAmountInCents = product.priceInCents * input.quantity;
    const baseFeeInCents = parseInt(this.configService.get<string>('BASE_FEE_CENTS', '500000'), 10);
    const deliveryFeeInCents = parseInt(this.configService.get<string>('DELIVERY_FEE_CENTS', '800000'), 10);

    const pendingTransaction = Transaction.createPending({
      id: randomUUID(),
      productId: input.productId,
      quantity: input.quantity,
      customerId: input.customerId,
      deliveryId: input.deliveryId,
      productAmountInCents,
      baseFeeInCents,
      deliveryFeeInCents,
    });

    const createdTransaction = await this.transactionRepository.create(pendingTransaction);

    let acceptanceToken: string;
    try {
      acceptanceToken = await this.paymentGateway.getAcceptanceToken();
    } catch (error: any) {
      const gatewayError =
        error instanceof PaymentGatewayError
          ? error
          : new PaymentGatewayError(error.message || 'Error getting acceptance token');

      const failedTx = createdTransaction.withStatus('ERROR', gatewayError.message);
      await this.transactionRepository.update(failedTx);
      return Result.fail(gatewayError);
    }

    try {
      const gatewayResult = await this.paymentGateway.createTransaction({
        reference: createdTransaction.id,
        amountInCents: createdTransaction.totalAmountInCents,
        currency: 'COP',
        cardToken: input.cardToken,
        acceptanceToken,
        customerEmail: input.customerEmail,
        installments: input.installments,
      });

      const updatedTx = createdTransaction
        .withWompiReference(gatewayResult.wompiTransactionId)
        .withStatus(gatewayResult.status as any, gatewayResult.statusDetail);

      const savedTx = await this.transactionRepository.update(updatedTx);
      return Result.ok(savedTx);
    } catch (error: any) {
      const gatewayError =
        error instanceof PaymentGatewayError
          ? error
          : new PaymentGatewayError(error.message || 'Error creating transaction');

      const failedTx = createdTransaction.withStatus('ERROR', gatewayError.message);
      await this.transactionRepository.update(failedTx);
      return Result.fail(gatewayError);
    }
  }
}
