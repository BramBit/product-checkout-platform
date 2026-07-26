"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.createTable('customers', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        full_name: {
            type: 'varchar(200)',
            notNull: true,
        },
        email: {
            type: 'varchar(200)',
            notNull: true,
            unique: true,
        },
        phone: {
            type: 'varchar(20)',
            notNull: true,
        },
        document_id: {
            type: 'varchar(30)',
            notNull: true,
        },
        created_at: {
            type: 'timestamptz',
            notNull: true,
            default: pgm.func('now()'),
        },
    });
}
async function down(pgm) {
    pgm.dropTable('customers');
}
//# sourceMappingURL=1700000000002_create-customers.js.map