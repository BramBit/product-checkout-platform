import { CreateOrFindCustomerUseCase, GetCustomerByIdUseCase } from './create-or-find-customer.use-case';
import { Customer } from '../../domain/entities/customer.entity';
import type { CustomerRepositoryPort } from '../../domain/ports/customer-repository.port';
import { InvalidCustomerDataError, CustomerNotFoundError } from '../../../../shared/kernel/domain-errors';

describe('CreateOrFindCustomerUseCase', () => {
  let useCase: CreateOrFindCustomerUseCase;
  let mockRepository: jest.Mocked<CustomerRepositoryPort>;

  const input = {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+573009876543',
    documentId: '9876543210',
  };

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new CreateOrFindCustomerUseCase(mockRepository);
  });

  it('should return existing customer without creating a new one if customer email exists', async () => {
    const existingCustomer = Customer.create({
      id: 'existing-id',
      ...input,
      createdAt: new Date(),
    });

    mockRepository.findByEmail.mockResolvedValue(existingCustomer);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(existingCustomer);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should create and return a new customer if email does not exist', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.create.mockImplementation(async (customer) => customer);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    const created = result.getValue();
    expect(created.email).toBe(input.email);
    expect(created.fullName).toBe(input.fullName);
    expect(created.phone).toBe(input.phone);
    expect(created.documentId).toBe(input.documentId);
    expect(mockRepository.findByEmail).toHaveBeenCalledWith(input.email);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should fail with InvalidCustomerDataError when email is invalid', async () => {
    const invalidInput = { ...input, email: 'invalid-email' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidCustomerDataError);
    expect(result.getError().message).toBe('Invalid email format');
    expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should fail with InvalidCustomerDataError when documentId is empty', async () => {
    const invalidInput = { ...input, documentId: '  ' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidCustomerDataError);
    expect(result.getError().message).toBe('Document ID cannot be empty');
    expect(mockRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});

describe('GetCustomerByIdUseCase', () => {
  let useCase: GetCustomerByIdUseCase;
  let mockRepository: jest.Mocked<CustomerRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new GetCustomerByIdUseCase(mockRepository);
  });

  it('should return customer when found', async () => {
    const customer = Customer.create({
      id: 'cust-123',
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567890',
      documentId: '123456',
    });
    mockRepository.findById.mockResolvedValue(customer);

    const result = await useCase.execute('cust-123');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(customer);
  });

  it('should fail with CustomerNotFoundError when customer is not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('cust-123');

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(CustomerNotFoundError);
  });
});
