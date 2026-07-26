import { CatalogController } from './catalog.controller';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { Result } from '../../../../shared/kernel/result';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundError } from '../../../../shared/kernel/domain-errors';

describe('CatalogController', () => {
  let controller: CatalogController;
  let listProductsUseCase: jest.Mocked<ListProductsUseCase>;
  let getProductByIdUseCase: jest.Mocked<GetProductByIdUseCase>;

  const mockProduct = Product.create({
    id: 'prod-123',
    name: 'Test Product',
    description: 'Description',
    priceInCents: 50000,
    stockQuantity: 10,
    imageUrl: 'https://example.com/image.png',
  });

  beforeEach(() => {
    listProductsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListProductsUseCase>;

    getProductByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetProductByIdUseCase>;

    controller = new CatalogController(listProductsUseCase, getProductByIdUseCase);
  });

  describe('listProducts', () => {
    it('should call ListProductsUseCase.execute and return mapped products', async () => {
      listProductsUseCase.execute.mockResolvedValue(Result.ok([mockProduct]));

      const result = await controller.listProducts();

      expect(listProductsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('prod-123');
      expect(result[0].name).toBe('Test Product');
    });
  });

  describe('getProductById', () => {
    it('should call GetProductByIdUseCase.execute with correct ID and return product DTO', async () => {
      getProductByIdUseCase.execute.mockResolvedValue(Result.ok(mockProduct));

      const result = await controller.getProductById('prod-123');

      expect(getProductByIdUseCase.execute).toHaveBeenCalledWith('prod-123');
      expect(result.id).toBe('prod-123');
      expect(result.name).toBe('Test Product');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const domainError = new ProductNotFoundError('Product not found');
      getProductByIdUseCase.execute.mockResolvedValue(Result.fail(domainError));

      try {
        await controller.getProductById('invalid-id');
        fail('Should have thrown domainError');
      } catch (err: any) {
        expect(err).toBe(domainError);
      }
    });
  });
});
