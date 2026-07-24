import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port';
import { PG_POOL } from '../../../../shared/infrastructure/database/pg-pool.provider';

interface DeliveryRow {
  id: string;
  customer_id: string;
  address: string;
  city: string;
  region: string;
  postal_code: string | null;
  created_at: Date;
}

@Injectable()
export class PostgresDeliveryRepository implements DeliveryRepositoryPort {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {}

  private mapRowToEntity(row: DeliveryRow): Delivery {
    return Delivery.create({
      id: row.id,
      customerId: row.customer_id,
      address: row.address,
      city: row.city,
      region: row.region,
      postalCode: row.postal_code ?? undefined,
      createdAt: row.created_at,
    });
  }

  async create(delivery: Delivery): Promise<Delivery> {
    const result = await this.pool.query<DeliveryRow>(
      'INSERT INTO deliveries (id, customer_id, address, city, region, postal_code, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, customer_id, address, city, region, postal_code, created_at',
      [
        delivery.id,
        delivery.customerId,
        delivery.address,
        delivery.city,
        delivery.region,
        delivery.postalCode ?? null,
        delivery.createdAt,
      ],
    );
    return this.mapRowToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Delivery | null> {
    const result = await this.pool.query<DeliveryRow>(
      'SELECT id, customer_id, address, city, region, postal_code, created_at FROM deliveries WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }
}
