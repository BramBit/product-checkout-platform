import { Product } from './product.entity';

describe('Product Entity', () => {
  const validProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    description: 'Test Description',
    priceInCents: 500000,
    stockQuantity: 10,
    imageUrl: 'https://example.com/image.png',
    createdAt: new Date(),
  };

  it('should create a Product instance correctly with Product.create()', () => {
    const product = Product.create(validProps);

    expect(product).toBeInstanceOf(Product);
    expect(product.id).toBe(validProps.id);
    expect(product.name).toBe(validProps.name);
    expect(product.description).toBe(validProps.description);
    expect(product.priceInCents).toBe(validProps.priceInCents);
    expect(product.stockQuantity).toBe(validProps.stockQuantity);
    expect(product.imageUrl).toBe(validProps.imageUrl);
    expect(product.createdAt).toBe(validProps.createdAt);
  });

  describe('hasEnoughStock', () => {
    it('should return true when stock is equal to requested quantity', () => {
      const product = Product.create(validProps);
      expect(product.hasEnoughStock(10)).toBe(true);
    });

    it('should return true when stock is greater than requested quantity', () => {
      const product = Product.create(validProps);
      expect(product.hasEnoughStock(5)).toBe(true);
    });

    it('should return false when stock is less than requested quantity', () => {
      const product = Product.create(validProps);
      expect(product.hasEnoughStock(15)).toBe(false);
    });
  });

  describe('decreaseStock', () => {
    it('should return a new Product instance with reduced stock quantity', () => {
      const product = Product.create(validProps);
      const updatedProduct = product.decreaseStock(3);

      expect(updatedProduct).not.toBe(product);
      expect(updatedProduct.stockQuantity).toBe(7);
      expect(product.stockQuantity).toBe(10); // Check immutability
    });

    it('should throw an error when requested quantity exceeds available stock', () => {
      const product = Product.create(validProps);

      expect(() => product.decreaseStock(12)).toThrow(
        `Insufficient stock for product ${validProps.id}. Available: 10, requested: 12`,
      );
    });
  });
});
