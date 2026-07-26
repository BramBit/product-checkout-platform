import { Pool } from 'pg';
import { PostgresProductRepository } from './postgres-product.repository';
import { Product } from '../../domain/entities/product.entity';

describe('PostgresProductRepository', () => {
  let repository: PostgresProductRepository;
  let pool: jest.Mocked<Pool>;

  const mockProductRow = {
    id: 'prod-1',
    name: 'Product 1',
    description: 'Desc 1',
    price_in_cents: 10000,
    stock_quantity: 5,
    image_url: 'http://example.com/p1.png',
    created_at: new Date('2026-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    pool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    repository = new PostgresProductRepository(pool);
  });

  describe('findAll', () => {
    it('should query products table and return mapped Product entities', async () => {
      pool.query.mockResolvedValue({
        rows: [mockProductRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const products = await repository.findAll();

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, name, description, price_in_cents, stock_quantity, image_url, created_at FROM products ORDER BY created_at DESC',
      );
      expect(products).toHaveLength(1);
      expect(products[0]).toBeInstanceOf(Product);
      expect(products[0].id).toBe('prod-1');
      expect(products[0].name).toBe('Product 1');
    });

    it('should map undefined image_url when image_url column is null', async () => {
      pool.query.mockResolvedValue({
        rows: [{ ...mockProductRow, image_url: null }],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const products = await repository.findAll();
      expect(products[0].imageUrl).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('should return Product entity when found by id', async () => {
      pool.query.mockResolvedValue({
        rows: [mockProductRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const product = await repository.findById('prod-1');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, name, description, price_in_cents, stock_quantity, image_url, created_at FROM products WHERE id = $1',
        ['prod-1'],
      );
      expect(product).toBeInstanceOf(Product);
      expect(product?.id).toBe('prod-1');
    });

    it('should return null when rows is empty', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const product = await repository.findById('non-existent');

      expect(product).toBeNull();
    });
  });

  describe('updateStock', () => {
    it('should execute UPDATE query with correct parameters', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      await repository.updateStock('prod-1', 15);

      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE products SET stock_quantity = $1 WHERE id = $2',
        [15, 'prod-1'],
      );
    });
  });
});
