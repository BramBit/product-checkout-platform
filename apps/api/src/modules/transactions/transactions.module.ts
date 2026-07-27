import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CatalogModule } from '../catalog/catalog.module';
import { TRANSACTION_REPOSITORY_PORT } from './domain/ports/transaction-repository.port';
import { PAYMENT_GATEWAY_PORT } from './domain/ports/payment-gateway.port';
import { PostgresTransactionRepository } from './infrastructure/persistence/postgres-transaction.repository';
import { PaymentGatewayAdapter } from './infrastructure/gateway/payment-gateway.adapter';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from './application/use-cases/check-transaction-status.use-case';
import { TransactionsController } from './infrastructure/http/transactions.controller';

@Module({
  imports: [
    HttpModule,
    CatalogModule,
  ],
  controllers: [TransactionsController],
  providers: [
    {
      provide: TRANSACTION_REPOSITORY_PORT,
      useClass: PostgresTransactionRepository,
    },
    {
      provide: PAYMENT_GATEWAY_PORT,
      useClass: PaymentGatewayAdapter,
    },
    CreateTransactionUseCase,
    CheckTransactionStatusUseCase,
  ],
  exports: [
    TRANSACTION_REPOSITORY_PORT,
    PAYMENT_GATEWAY_PORT,
    CreateTransactionUseCase,
    CheckTransactionStatusUseCase,
  ],
})
export class TransactionsModule {}
