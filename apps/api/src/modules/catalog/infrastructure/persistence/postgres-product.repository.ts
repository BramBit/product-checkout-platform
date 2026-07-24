import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepositoryPort } from '../../domain/ports/product-repository.port';
import { PG_POOL } from '../../../../shared/infrastructure/database/pg-pool.provider';

interface ProductRow {
  id: string;
  name: string;
  description: string;
  price_in_cents: number;
  stock_quantity: number;
  image_url: string | null;
  created_at: Date;
}

@Injectable()
export class PostgresProductRepository implements ProductRepositoryPort {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {}

  private mapRowToEntity(row: ProductRow): Product {
    return Product.create({
      id: row.id,
      name: row.name,
      description: row.description,
      priceInCents: row.price_in_cents,
      stockQuantity: row.stock_quantity,
      imageUrl: row.image_url ?? undefined,
      createdAt: row.created_at,
    });
  }

  async findAll(): Promise<Product[]> {
    const result = await this.pool.query<ProductRow>(
      'SELECT id, name, description, price_in_cents, stock_quantity, image_url, created_at FROM products ORDER BY created_at DESC',
    );
    return result.rows.map((row) => this.mapRowToEntity(row));
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.pool.query<ProductRow>(
      'SELECT id, name, description, price_in_cents, stock_quantity, image_url, created_at FROM products WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }

  async updateStock(id: string, newStockQuantity: number): Promise<void> {
    await this.pool.query(
      'UPDATE products SET stock_quantity = $1 WHERE id = $2',
      [newStockQuantity, id],
    );
  }
}
