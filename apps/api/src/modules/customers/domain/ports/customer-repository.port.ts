import { Customer } from '../entities/customer.entity';

export interface CustomerRepositoryPort {
  findByEmail(email: string): Promise<Customer | null>;
  create(customer: Customer): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
}

export const CUSTOMER_REPOSITORY_PORT = Symbol('CustomerRepositoryPort');
