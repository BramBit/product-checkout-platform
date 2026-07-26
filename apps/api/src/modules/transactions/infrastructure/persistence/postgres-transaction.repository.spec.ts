import { Pool } from 'pg';
import { PostgresTransactionRepository } from './postgres-transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('PostgresTransactionRepository', () => {
  let repository: PostgresTransactionRepository;
  let pool: jest.Mocked<Pool>;

  const mockTxRow = {
    id: 'tx-1',
    product_id: 'prod-1',
    quantity: 2,
    customer_id: 'cust-1',
    delivery_id: 'del-1',
    product_amount_in_cents: 100000,
    base_fee_in_cents: 5000,
    delivery_fee_in_cents: 3000,
    total_amount_in_cents: 108000,
    status: 'PENDING',
    wompi_transaction_id: null,
    wompi_status_detail: null,
    created_at: new Date('2026-01-01T00:00:00Z'),
    updated_at: new Date('2026-01-01T00:00:00Z'),
  };

  const mockTransaction = Transaction.createPending({
    id: 'tx-1',
    productId: 'prod-1',
    quantity: 2,
    customerId: 'cust-1',
    deliveryId: 'del-1',
    productAmountInCents: 100000,
    baseFeeInCents: 5000,
    deliveryFeeInCents: 3000,
  });

  beforeEach(() => {
    pool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    repository = new PostgresTransactionRepository(pool);
  });

  describe('create', () => {
    it('should insert transaction and return mapped Transaction entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockTxRow],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await repository.create(mockTransaction);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO transactions'),
        [
          mockTransaction.id,
          mockTransaction.productId,
          mockTransaction.quantity,
          mockTransaction.customerId,
          mockTransaction.deliveryId,
          mockTransaction.productAmountInCents,
          mockTransaction.baseFeeInCents,
          mockTransaction.deliveryFeeInCents,
          mockTransaction.totalAmountInCents,
          mockTransaction.status,
          mockTransaction.wompiTransactionId,
          mockTransaction.wompiStatusDetail,
          mockTransaction.createdAt,
          mockTransaction.updatedAt,
        ],
      );
      expect(result.id).toBe('tx-1');
      expect(result.status).toBe('PENDING');
    });
  });

  describe('findById', () => {
    it('should query transaction by id and return Transaction entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockTxRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await repository.findById('tx-1');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM transactions WHERE id = $1',
        ['tx-1'],
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe('tx-1');
      expect(result?.status).toBe('PENDING');
    });

    it('should return null when transaction not found', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update transaction and return updated Transaction entity', async () => {
      const updatedRow = {
        ...mockTxRow,
        status: 'APPROVED',
        wompi_transaction_id: 'wompi-123',
        wompi_status_detail: 'Approved successfully',
      };

      pool.query.mockResolvedValue({
        rows: [updatedRow],
        command: 'UPDATE',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const updatedTransaction = mockTransaction.withStatus('APPROVED', 'Approved successfully');

      const result = await repository.update(updatedTransaction);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE transactions SET'),
        [
          updatedTransaction.productId,
          updatedTransaction.quantity,
          updatedTransaction.customerId,
          updatedTransaction.deliveryId,
          updatedTransaction.productAmountInCents,
          updatedTransaction.baseFeeInCents,
          updatedTransaction.deliveryFeeInCents,
          updatedTransaction.totalAmountInCents,
          updatedTransaction.status,
          updatedTransaction.wompiTransactionId,
          updatedTransaction.wompiStatusDetail,
          updatedTransaction.updatedAt,
          updatedTransaction.id,
        ],
      );
      expect(result.id).toBe('tx-1');
      expect(result.status).toBe('APPROVED');
      expect(result.wompiTransactionId).toBe('wompi-123');
    });
  });
});
