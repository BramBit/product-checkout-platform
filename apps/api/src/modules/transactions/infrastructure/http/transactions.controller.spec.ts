import { TransactionsController } from './transactions.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { CheckTransactionStatusUseCase } from '../../application/use-cases/check-transaction-status.use-case';
import { Result } from '../../../../shared/kernel/result';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionNotFoundError, PaymentGatewayError } from '../../../../shared/kernel/domain-errors';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let createTransactionUseCase: jest.Mocked<CreateTransactionUseCase>;
  let checkTransactionStatusUseCase: jest.Mocked<CheckTransactionStatusUseCase>;

  const mockTransaction = Transaction.createPending({
    id: 'tx-123',
    productId: 'prod-123',
    quantity: 2,
    customerId: 'cust-123',
    deliveryId: 'del-123',
    productAmountInCents: 100000,
    baseFeeInCents: 5000,
    deliveryFeeInCents: 3000,
  });

  beforeEach(() => {
    createTransactionUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateTransactionUseCase>;

    checkTransactionStatusUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CheckTransactionStatusUseCase>;

    controller = new TransactionsController(createTransactionUseCase, checkTransactionStatusUseCase);
  });

  describe('createTransaction', () => {
    it('should call CreateTransactionUseCase.execute and return transaction DTO', async () => {
      const dto = {
        productId: 'prod-123',
        quantity: 2,
        customer: {
          fullName: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          documentId: 'DOC123',
        },
        delivery: {
          address: 'Calle 123',
          city: 'Bogotá',
          region: 'Cundinamarca',
        },
        cardToken: 'tok_test',
        acceptanceToken: 'acc_test',
        installments: 1,
      };
      createTransactionUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.createTransaction(dto);

      expect(createTransactionUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('tx-123');
      expect(result.status).toBe('PENDING');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new PaymentGatewayError('Gateway failed');
      createTransactionUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.createTransaction({} as any);
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });

  describe('getTransactionById', () => {
    it('should call CheckTransactionStatusUseCase.execute with correct ID and return transaction DTO', async () => {
      checkTransactionStatusUseCase.execute.mockResolvedValue(Result.ok(mockTransaction));

      const result = await controller.getTransactionById('tx-123');

      expect(checkTransactionStatusUseCase.execute).toHaveBeenCalledWith('tx-123');
      expect(result.id).toBe('tx-123');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new TransactionNotFoundError('Transaction not found');
      checkTransactionStatusUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.getTransactionById('invalid-id');
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });
});
