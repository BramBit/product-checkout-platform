import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  updateStock(id: string, newStockQuantity: number): Promise<void>;
}

export const PRODUCT_REPOSITORY_PORT = Symbol('ProductRepositoryPort');
