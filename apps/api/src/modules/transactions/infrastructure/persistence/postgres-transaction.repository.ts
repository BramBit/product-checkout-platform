import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../domain/ports/transaction-repository.port';
import { PG_POOL } from '../../../../shared/infrastructure/database/pg-pool.provider';

interface TransactionRow {
  id: string;
  product_id: string;
  quantity: number;
  customer_id: string;
  delivery_id: string;
  product_amount_in_cents: number;
  base_fee_in_cents: number;
  delivery_fee_in_cents: number;
  total_amount_in_cents: number;
  status: string;
  wompi_transaction_id: string | null;
  wompi_status_detail: string | null;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class PostgresTransactionRepository implements TransactionRepositoryPort {
  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
  ) {}

  private mapRowToEntity(row: TransactionRow): Transaction {
    // Reflect constructor structure via createPending or raw mapping using private constructor if needed
    // Since Transaction constructor is private, we can use Object.assign or a helper method or type casting
    return Object.assign(Object.create(Transaction.prototype), {
      id: row.id,
      productId: row.product_id,
      quantity: row.quantity,
      customerId: row.customer_id,
      deliveryId: row.delivery_id,
      productAmountInCents: row.product_amount_in_cents,
      baseFeeInCents: row.base_fee_in_cents,
      deliveryFeeInCents: row.delivery_fee_in_cents,
      totalAmountInCents: row.total_amount_in_cents,
      status: row.status as TransactionStatus,
      wompiTransactionId: row.wompi_transaction_id,
      wompiStatusDetail: row.wompi_status_detail,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const result = await this.pool.query<TransactionRow>(
      `INSERT INTO transactions (
        id, product_id, quantity, customer_id, delivery_id,
        product_amount_in_cents, base_fee_in_cents, delivery_fee_in_cents, total_amount_in_cents,
        status, wompi_transaction_id, wompi_status_detail, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        transaction.id,
        transaction.productId,
        transaction.quantity,
        transaction.customerId,
        transaction.deliveryId,
        transaction.productAmountInCents,
        transaction.baseFeeInCents,
        transaction.deliveryFeeInCents,
        transaction.totalAmountInCents,
        transaction.status,
        transaction.wompiTransactionId,
        transaction.wompiStatusDetail,
        transaction.createdAt,
        transaction.updatedAt,
      ],
    );
    return this.mapRowToEntity(result.rows[0]);
  }

  async findById(id: string): Promise<Transaction | null> {
    const result = await this.pool.query<TransactionRow>(
      'SELECT * FROM transactions WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEntity(result.rows[0]);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const result = await this.pool.query<TransactionRow>(
      `UPDATE transactions SET
        product_id = $1,
        quantity = $2,
        customer_id = $3,
        delivery_id = $4,
        product_amount_in_cents = $5,
        base_fee_in_cents = $6,
        delivery_fee_in_cents = $7,
        total_amount_in_cents = $8,
        status = $9,
        wompi_transaction_id = $10,
        wompi_status_detail = $11,
        updated_at = $12
      WHERE id = $13
      RETURNING *`,
      [
        transaction.productId,
        transaction.quantity,
        transaction.customerId,
        transaction.deliveryId,
        transaction.productAmountInCents,
        transaction.baseFeeInCents,
        transaction.deliveryFeeInCents,
        transaction.totalAmountInCents,
        transaction.status,
        transaction.wompiTransactionId,
        transaction.wompiStatusDetail,
        transaction.updatedAt,
        transaction.id,
      ],
    );
    return this.mapRowToEntity(result.rows[0]);
  }
}
