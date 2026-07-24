import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/kernel/result';
import { InvalidCustomerDataError, CustomerNotFoundError } from '../../../../shared/kernel/domain-errors';
import { Customer } from '../../domain/entities/customer.entity';
import { type CustomerRepositoryPort, CUSTOMER_REPOSITORY_PORT } from '../../domain/ports/customer-repository.port';
import { randomUUID } from 'crypto';

export interface CreateOrFindCustomerInput {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
}

@Injectable()
export class CreateOrFindCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async execute(input: CreateOrFindCustomerInput): Promise<Result<Customer, InvalidCustomerDataError>> {
    if (!input.email || !this.validateEmail(input.email)) {
      return Result.fail(new InvalidCustomerDataError('Invalid email format'));
    }

    if (!input.documentId || input.documentId.trim() === '') {
      return Result.fail(new InvalidCustomerDataError('Document ID cannot be empty'));
    }

    const existingCustomer = await this.customerRepository.findByEmail(input.email);
    if (existingCustomer) {
      return Result.ok(existingCustomer);
    }

    const newCustomer = Customer.create({
      id: randomUUID(),
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      documentId: input.documentId,
      createdAt: new Date(),
    });

    const createdCustomer = await this.customerRepository.create(newCustomer);
    return Result.ok(createdCustomer);
  }
}

@Injectable()
export class GetCustomerByIdUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Customer, CustomerNotFoundError>> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      return Result.fail(new CustomerNotFoundError(`Customer with id ${id} not found`));
    }
    return Result.ok(customer);
  }
}
