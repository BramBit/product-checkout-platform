import { ListProductsUseCase } from './list-products.use-case';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepositoryPort } from '../../domain/ports/product-repository.port';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let mockRepository: jest.Mocked<ProductRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };

    useCase = new ListProductsUseCase(mockRepository);
  });

  it('should return Result.ok with the list of products when repository responds correctly', async () => {
    const products = [
      Product.create({
        id: '1',
        name: 'Product 1',
        description: 'Desc 1',
        priceInCents: 1000,
        stockQuantity: 5,
        createdAt: new Date(),
      }),
      Product.create({
        id: '2',
        name: 'Product 2',
        description: 'Desc 2',
        priceInCents: 2000,
        stockQuantity: 8,
        createdAt: new Date(),
      }),
    ];

    mockRepository.findAll.mockResolvedValue(products);

    const result = await useCase.execute();

    expect(result.isSuccess).toBe(true);
    expect(result.isFailure).toBe(false);
    expect(result.getValue()).toEqual(products);
    expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
