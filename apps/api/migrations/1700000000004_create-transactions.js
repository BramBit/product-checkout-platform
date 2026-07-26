"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
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
async function down(pgm) {
    pgm.dropTable('transactions');
}
//# sourceMappingURL=1700000000004_create-transactions.js.map