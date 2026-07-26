import { ConfigService } from '@nestjs/config';
import { CreateTransactionUseCase, CreateTransactionInput } from './create-transaction.use-case';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { ProductRepositoryPort } from '../../../catalog/domain/ports/product-repository.port';
import { PaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { Product } from '../../../catalog/domain/entities/product.entity';
import { Transaction } from '../../domain/entities/transaction.entity';
import {
  ProductNotFoundError,
  InsufficientStockError,
  InvalidTransactionDataError,
  PaymentGatewayError,
  InvalidCardDataError,
} from '../../../../shared/kernel/domain-errors';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let transactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let productRepository: jest.Mocked<ProductRepositoryPort>;
  let paymentGateway: jest.Mocked<PaymentGatewayPort>;
  let configService: jest.Mocked<ConfigService>;

  const mockInput: CreateTransactionInput = {
    productId: 'prod-123',
    quantity: 2,
    customerId: 'cust-123',
    deliveryId: 'del-123',
    cardToken: 'tok_test',
    installments: 1,
    customerEmail: 'test@example.com',
  };

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

    configService = {
      get: jest.fn((key: string, defaultValue?: any) => defaultValue),
    } as any;

    useCase = new CreateTransactionUseCase(
      transactionRepository,
      productRepository,
      paymentGateway,
      configService,
    );
  });

  it('should process transaction successfully (happy path)', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    
    transactionRepository.create.mockImplementation(async (tx) => tx);
    paymentGateway.getAcceptanceToken.mockResolvedValue('acc-token-123');
    paymentGateway.createTransaction.mockResolvedValue({
      wompiTransactionId: 'wompi-tx-123',
      status: 'APPROVED',
      statusDetail: 'APPROVED',
    });
    transactionRepository.update.mockImplementation(async (tx) => tx);

    const result = await useCase.execute(mockInput);

    expect(result.isSuccess).toBe(true);
    const transaction = result.getValue();
    expect(transaction.status).toBe('APPROVED');
    expect(transaction.wompiTransactionId).toBe('wompi-tx-123');
    expect(paymentGateway.createTransaction).toHaveBeenCalledTimes(1);
    expect(transactionRepository.create).toHaveBeenCalledTimes(1);
    expect(transactionRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should return ProductNotFoundError if product does not exist and NEVER call paymentGateway.createTransaction', async () => {
    productRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(mockInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(ProductNotFoundError);
    expect(paymentGateway.createTransaction).not.toHaveBeenCalled();
  });

  it('should return InsufficientStockError if stock is not enough', async () => {
    const lowStockProduct = Product.create({
      id: 'prod-123',
      name: 'Test Product',
      description: 'Description',
      priceInCents: 500000,
      stockQuantity: 1, // Only 1 available, input asks for 2
      imageUrl: 'http://example.com/image.jpg',
      createdAt: new Date(),
    });

    productRepository.findById.mockResolvedValue(lowStockProduct);

    const result = await useCase.execute(mockInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InsufficientStockError);
    expect(paymentGateway.createTransaction).not.toHaveBeenCalled();
  });

  it('should return InvalidTransactionDataError when quantity is 0 or less', async () => {
    const invalidInput = { ...mockInput, quantity: 0 };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidTransactionDataError);
    expect(productRepository.findById).not.toHaveBeenCalled();
    expect(paymentGateway.createTransaction).not.toHaveBeenCalled();
  });

  it('should return PaymentGatewayError and update transaction status to ERROR when gateway fails to get acceptance token', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    transactionRepository.create.mockImplementation(async (tx) => tx);
    paymentGateway.getAcceptanceToken.mockRejectedValue(new Error('Token fetch error'));
    transactionRepository.update.mockImplementation(async (tx) => tx);

    const result = await useCase.execute(mockInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(PaymentGatewayError);
    expect(transactionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        wompiStatusDetail: 'Token fetch error',
      }),
    );
  });

  it('should return PaymentGatewayError and update transaction status to ERROR when gateway throws an error on createTransaction', async () => {
    productRepository.findById.mockResolvedValue(mockProduct);
    transactionRepository.create.mockImplementation(async (tx) => tx);
    paymentGateway.getAcceptanceToken.mockResolvedValue('acc-token-123');
    paymentGateway.createTransaction.mockRejectedValue(new Error('Gateway error'));
    transactionRepository.update.mockImplementation(async (tx) => tx);

    const result = await useCase.execute(mockInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(PaymentGatewayError);
    expect(transactionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        wompiStatusDetail: 'Gateway error',
      }),
    );
  });

  it('should instantiate InvalidCardDataError properly', () => {
    const errorDefault = new InvalidCardDataError();
    const errorCustom = new InvalidCardDataError('Custom message');

    expect(errorDefault.code).toBe('INVALID_CARD_DATA');
    expect(errorDefault.message).toBe('Invalid card data provided');
    expect(errorCustom.message).toBe('Custom message');
  });
});
