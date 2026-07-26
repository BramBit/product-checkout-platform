"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shorthands = void 0;
exports.up = up;
exports.down = down;
exports.shorthands = undefined;
async function up(pgm) {
    pgm.addColumn('transactions', {
        quantity: {
            type: 'integer',
            notNull: true,
            default: 1,
        },
    });
}
async function down(pgm) {
    pgm.dropColumn('transactions', 'quantity');
}
//# sourceMappingURL=1700000000005_add-quantity-to-transactions.js.map