import { GetProductByIdUseCase } from './get-product-by-id.use-case';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import {
  ProductNotFoundError,
  InvalidCustomerDataError,
  InvalidDeliveryDataError,
  InvalidTransactionDataError,
  InvalidCardDataError,
} from '../../../../shared/kernel/domain-errors';

describe('GetProductByIdUseCase', () => {
  let useCase: GetProductByIdUseCase;
  let mockRepository: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new GetProductByIdUseCase(mockRepository);
  });

  it('should return Result.ok with the product when it exists', async () => {
    const product = Product.create({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Product',
      description: 'Test Description',
      priceInCents: 500000,
      stockQuantity: 10,
      createdAt: new Date(),
    });

    mockRepository.findById.mockResolvedValue(product);

    const result = await useCase.execute(product.id);

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.getValue()).toEqual(product);
    expect(mockRepository.findById).toHaveBeenCalledWith(product.id);
  });

  it('should return Result.fail with ProductNotFoundError when repository returns null', async () => {
    const nonExistentId = 'non-existent-id';
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(nonExistentId);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(ProductNotFoundError);
    expect(result.getError().code).toBe('PRODUCT_NOT_FOUND');
    expect(mockRepository.findById).toHaveBeenCalledWith(nonExistentId);
  });

  it('should instantiate unused domain error classes', () => {
    const invalidCustomerErr = new InvalidCustomerDataError();
    const invalidDeliveryErr = new InvalidDeliveryDataError();
    const invalidTxErr = new InvalidTransactionDataError();
    const invalidCardErr = new InvalidCardDataError();

    expect(invalidCustomerErr.code).toBe('INVALID_CUSTOMER_DATA');
    expect(invalidDeliveryErr.code).toBe('INVALID_DELIVERY_DATA');
    expect(invalidTxErr.code).toBe('INVALID_TRANSACTION_DATA');
    expect(invalidCardErr.code).toBe('INVALID_CARD_DATA');
  });
});
