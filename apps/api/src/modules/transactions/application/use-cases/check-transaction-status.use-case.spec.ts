import { CheckTransactionStatusUseCase } from './check-transaction-status.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { ProductRepositoryPort } from '../../../catalog/domain/ports/product-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { Transaction } from '../../domain/entities/transaction.entity';
import { Product } from '../../../catalog/domain/entities/product.entity';
import {
  TransactionNotFoundError,
  PaymentGatewayError,
} from '../../../../shared/kernel/domain-errors';

describe('CheckTransactionStatusUseCase', () => {
  let useCase: CheckTransactionStatusUseCase;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;

  const basePendingTx = Transaction.createPending({
    id: 'tx-123',
    productId: 'prod-123',
    quantity: 2,
    customerId: 'cust-123',
    deliveryId: 'del-123',
    productAmountInCents: 1000000,
    baseFeeInCents: 500000,
    deliveryFeeInCents: 800000,
  }).withWompiReference('wompi-tx-123');

  const mockProduct = Product.create({
    id: 'prod-123',
    name: 'Test Product',
    description: 'Description',
    priceInCents: 500000,
    stockQuantity: 10,
    imageUrl: 'http://example.com/image.jpg',
    createdAt: new Date(),
  });

  beforeEach(() => {
    transactionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };

    productRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    paymentGateway = {
      getAcceptanceToken: jest.fn(),
      createTransaction: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    useCase = new CheckTransactionStatusUseCase(
      transactionRepository,
      productRepository,
      paymentGateway,
    );
  });

  it('should return TransactionNotFoundError if transaction does not exist', async () => {
    transactionRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('tx-non-existent');

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(TransactionNotFoundError);
    expect(paymentGateway.getTransactionStatus).not.toHaveBeenCalled();
  });

  it('should return Result.ok without calling paymentGateway.getTransactionStatus when transaction is already in final status (APPROVED)', async () => {
    const approvedTx = basePendingTx.withStatus('APPROVED');
    transactionRepository.findById.mockResolvedValue(approvedTx);

    const result = await useCase.execute('tx-123');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('APPROVED');
    expect(paymentGateway.getTransactionStatus).not.toHaveBeenCalled();
  });

  it('should update stock with correct deducted quantity when transaction is PENDING and gateway responds APPROVED', async () => {
    transactionRepository.findById.mockResolvedValue(basePendingTx);
    paymentGateway.getTransactionStatus.mockResolvedValue({
      status: 'APPROVED',
      statusDetail: 'APPROVED_DETAIL',
    });
    transactionRepository.update.mockImplementation(async (tx) => tx);
    productRepository.findById.mockResolvedValue(mockProduct);

    const result = await useCase.execute('tx-123');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('APPROVED');
    expect(paymentGateway.getTransactionStatus).toHaveBeenCalledWith('wompi-tx-123');
    // Original stock is 10, transaction quantity is 2 -> new stock = 8
    expect(productRepository.updateStock).toHaveBeenCalledWith('prod-123', 8);
  });

  it('should NOT call productRepository.updateStock when transaction is PENDING and gateway responds DECLINED', async () => {
    transactionRepository.findById.mockResolvedValue(basePendingTx);
    paymentGateway.getTransactionStatus.mockResolvedValue({
      status: 'DECLINED',
      statusDetail: 'INSUFFICIENT_FUNDS',
    });
    transactionRepository.update.mockImplementation(async (tx) => tx);

    const result = await useCase.execute('tx-123');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe('DECLINED');
    expect(paymentGateway.getTransactionStatus).toHaveBeenCalledWith('wompi-tx-123');
    expect(productRepository.updateStock).not.toHaveBeenCalled();
  });

  it('should return PaymentGatewayError when gateway throws error fetching status', async () => {
    transactionRepository.findById.mockResolvedValue(basePendingTx);
    paymentGateway.getTransactionStatus.mockRejectedValue(new Error('Gateway status check failed'));

    const result = await useCase.execute('tx-123');

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(PaymentGatewayError);
    expect(transactionRepository.update).not.toHaveBeenCalled();
    expect(productRepository.updateStock).not.toHaveBeenCalled();
  });
});
