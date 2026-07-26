import { CustomersController } from './customers.controller';
import { CreateOrFindCustomerUseCase, GetCustomerByIdUseCase } from '../../application/use-cases/create-or-find-customer.use-case';
import { Result } from '../../../../shared/kernel/result';
import { Customer } from '../../domain/entities/customer.entity';
import { CustomerNotFoundError, InvalidCustomerDataError } from '../../../../shared/kernel/domain-errors';

describe('CustomersController', () => {
  let controller: CustomersController;
  let createOrFindCustomerUseCase: jest.Mocked<CreateOrFindCustomerUseCase>;
  let getCustomerByIdUseCase: jest.Mocked<GetCustomerByIdUseCase>;

  const mockCustomer = Customer.create({
    id: 'cust-123',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    documentId: 'DOC123',
  });

  beforeEach(() => {
    createOrFindCustomerUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateOrFindCustomerUseCase>;

    getCustomerByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetCustomerByIdUseCase>;

    controller = new CustomersController(createOrFindCustomerUseCase, getCustomerByIdUseCase);
  });

  describe('createOrFindCustomer', () => {
    it('should call CreateOrFindCustomerUseCase.execute and return customer DTO', async () => {
      const dto = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        documentId: 'DOC123',
      };
      createOrFindCustomerUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

      const result = await controller.createOrFindCustomer(dto);

      expect(createOrFindCustomerUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('cust-123');
      expect(result.email).toBe('john@example.com');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new InvalidCustomerDataError('Invalid data');
      createOrFindCustomerUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.createOrFindCustomer({} as any);
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });

  describe('getCustomerById', () => {
    it('should call GetCustomerByIdUseCase.execute with correct ID and return customer DTO', async () => {
      getCustomerByIdUseCase.execute.mockResolvedValue(Result.ok(mockCustomer));

      const result = await controller.getCustomerById('cust-123');

      expect(getCustomerByIdUseCase.execute).toHaveBeenCalledWith('cust-123');
      expect(result.id).toBe('cust-123');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new CustomerNotFoundError('Customer not found');
      getCustomerByIdUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.getCustomerById('invalid-id');
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });
});
