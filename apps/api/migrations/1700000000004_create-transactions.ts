import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('transactions', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    product_id: {
      type: 'uuid',
      notNull: true,
      references: 'products(id)',
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
      references: 'customers(id)',
    },
    delivery_id: {
      type: 'uuid',
      notNull: true,
      references: 'deliveries(id)',
    },
    product_amount_in_cents: {
      type: 'integer',
      notNull: true,
    },
    base_fee_in_cents: {
      type: 'integer',
      notNull: true,
    },
    delivery_fee_in_cents: {
      type: 'integer',
      notNull: true,
    },
    total_amount_in_cents: {
      type: 'integer',
      notNull: true,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'PENDING',
      check: "status IN ('PENDING', 'APPROVED', 'DECLINED', 'ERROR')",
    },
    wompi_transaction_id: {
      type: 'varchar(100)',
    },
    wompi_status_detail: {
      type: 'text',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('transactions');
}
