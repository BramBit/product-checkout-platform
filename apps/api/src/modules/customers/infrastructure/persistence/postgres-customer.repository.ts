import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { PG_POOL } from '../../../../shared/infrastructure/database/pg-pool.provider';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  document_id: string;
  created_at: Date;
}

@Injectable()
export class PostgresCustomerRepository implements CustomerRepositoryPort {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {}

  private mapRowToEntity(row: CustomerRow): Customer {
    return Customer.create({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      documentId: row.document_id,
      createdAt: row.created_at,
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await this.pool.query<CustomerRow>(
      'SELECT id, full_name, email, phone, document_id, created_at FROM customers WHERE email = $1',
      [email],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Customer | null> {
    const result = await this.pool.query<CustomerRow>(
      'SELECT id, full_name, email, phone, document_id, created_at FROM customers WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }

  async create(customer: Customer): Promise<Customer> {
    const result = await this.pool.query<CustomerRow>(
      'INSERT INTO customers (id, full_name, email, phone, document_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, phone, document_id, created_at',
      [
        customer.id,
        customer.fullName,
        customer.email,
        customer.phone,
        customer.documentId,
        customer.createdAt,
      ],
    );
    return this.mapRowToEntity(result.rows[0]);
  }
}
