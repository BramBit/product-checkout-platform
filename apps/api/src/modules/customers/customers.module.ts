import { Module } from '@nestjs/common';
import { CUSTOMER_REPOSITORY_PORT } from './domain/ports/customer-repository.port';
import { PostgresCustomerRepository } from './infrastructure/persistence/postgres-customer.repository';
import {
  CreateOrFindCustomerUseCase,
  GetCustomerByIdUseCase,
} from './application/use-cases/create-or-find-customer.use-case';
import { CustomersController } from './infrastructure/http/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [
    {
      provide: CUSTOMER_REPOSITORY_PORT,
      useClass: PostgresCustomerRepository,
    },
    CreateOrFindCustomerUseCase,
    GetCustomerByIdUseCase,
  ],
  exports: [
    CUSTOMER_REPOSITORY_PORT,
    CreateOrFindCustomerUseCase,
    GetCustomerByIdUseCase,
  ],
})
export class CustomersModule {}
