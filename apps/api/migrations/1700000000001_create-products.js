"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.createExtension('pgcrypto', { ifNotExists: true });
    pgm.createTable('products', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        name: {
            type: 'varchar(200)',
            notNull: true,
        },
        description: {
            type: 'text',
            notNull: true,
        },
        price_in_cents: {
            type: 'integer',
            notNull: true,
            check: 'price_in_cents > 0',
        },
        stock_quantity: {
            type: 'integer',
            notNull: true,
            check: 'stock_quantity >= 0',
        },
        image_url: {
            type: 'text',
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('now()'),
        },
    });
}
async function down(pgm) {
    pgm.dropTable('products');
}
//# sourceMappingURL=1700000000001_create-products.js.map