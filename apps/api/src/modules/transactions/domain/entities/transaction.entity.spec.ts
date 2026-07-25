import { Transaction } from './transaction.entity';

describe('Transaction Entity', () => {
  const basePendingProps = {
    id: 'tx-123',
    productId: 'prod-123',
    quantity: 2,
    customerId: 'cust-123',
    deliveryId: 'del-123',
    productAmountInCents: 1000000, // $10,000 COP
    baseFeeInCents: 500000,       // $5,000 COP
    deliveryFeeInCents: 800000,   // $8,000 COP
  };

  it('should calculate totalAmountInCents correctly with createPending()', () => {
    const transaction = Transaction.createPending(basePendingProps);

    expect(transaction).toBeInstanceOf(Transaction);
    expect(transaction.id).toBe(basePendingProps.id);
    expect(transaction.status).toBe('PENDING');
    expect(transaction.totalAmountInCents).toBe(1000000 + 500000 + 800000);
    expect(transaction.wompiTransactionId).toBeNull();
    expect(transaction.wompiStatusDetail).toBeNull();
  });

  describe('isFinalStatus', () => {
    it('should return false when status is PENDING', () => {
      const transaction = Transaction.createPending(basePendingProps);
      expect(transaction.isFinalStatus()).toBe(false);
    });

    it('should return true when status is APPROVED', () => {
      const transaction = Transaction.createPending(basePendingProps).withStatus('APPROVED');
      expect(transaction.isFinalStatus()).toBe(true);
    });

    it('should return true when status is DECLINED', () => {
      const transaction = Transaction.createPending(basePendingProps).withStatus('DECLINED');
      expect(transaction.isFinalStatus()).toBe(true);
    });

    it('should return true when status is ERROR', () => {
      const transaction = Transaction.createPending(basePendingProps).withStatus('ERROR');
      expect(transaction.isFinalStatus()).toBe(true);
    });
  });

  describe('immutability methods', () => {
    it('withWompiReference should return a new instance without mutating the original', () => {
      const original = Transaction.createPending(basePendingProps);
      const updated = original.withWompiReference('wompi-999');

      expect(updated).not.toBe(original);
      expect(original.wompiTransactionId).toBeNull();
      expect(updated.wompiTransactionId).toBe('wompi-999');
    });

    it('withStatus should return a new instance without mutating the original', () => {
      const original = Transaction.createPending(basePendingProps);
      const updated = original.withStatus('APPROVED', 'TRANSACTION_APPROVED');

      expect(updated).not.toBe(original);
      expect(original.status).toBe('PENDING');
      expect(updated.status).toBe('APPROVED');
      expect(updated.wompiStatusDetail).toBe('TRANSACTION_APPROVED');
    });
  });
});
