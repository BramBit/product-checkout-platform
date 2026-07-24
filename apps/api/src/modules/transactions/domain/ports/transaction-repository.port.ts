import { Transaction } from '../entities/transaction.entity';

export interface TransactionRepositoryPort {
  create(transaction: Transaction): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  update(transaction: Transaction): Promise<Transaction>;
}

export const TRANSACTION_REPOSITORY_PORT = Symbol('TransactionRepositoryPort');
