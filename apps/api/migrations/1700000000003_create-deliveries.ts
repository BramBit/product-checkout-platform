import { ColumnDefinitions, MigrationBuilder } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('deliveries', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    customer_id: {
      type: 'uuid',
      notNull: true,
      references: 'customers(id)',
    },
    address: {
      type: 'varchar(300)',
      notNull: true,
    },
    city: {
      type: 'varchar(100)',
      notNull: true,
    },
    region: {
      type: 'varchar(100)',
      notNull: true,
    },
    postal_code: {
      type: 'varchar(20)',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('deliveries');
}
