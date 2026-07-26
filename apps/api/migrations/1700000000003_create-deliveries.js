"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
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
async function down(pgm) {
    pgm.dropTable('deliveries');
}
//# sourceMappingURL=1700000000003_create-deliveries.js.map