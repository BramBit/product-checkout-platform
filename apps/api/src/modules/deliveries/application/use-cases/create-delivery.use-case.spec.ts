import { CreateDeliveryUseCase } from './create-delivery.use-case';
import { Delivery } from '../../domain/entities/delivery.entity';
import { Customer } from '../../../customers/domain/entities/customer.entity';
import type { DeliveryRepositoryPort } from '../../domain/ports/delivery-repository.port';
import type { CustomerRepositoryPort } from '../../../customers/domain/ports/customer-repository.port';
import { InvalidDeliveryDataError, CustomerNotFoundError } from '../../../../shared/kernel/domain-errors';

describe('CreateDeliveryUseCase', () => {
  let useCase: CreateDeliveryUseCase;
  let mockDeliveryRepository: jest.Mocked<DeliveryRepositoryPort>;
  let mockCustomerRepository: jest.Mocked<CustomerRepositoryPort>;

  const input = {
    customerId: '123e4567-e89b-12d3-a456-426614174000',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
  };

  const dummyCustomer = Customer.create({
    id: input.customerId,
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+573001234567',
    documentId: '1234567890',
    createdAt: new Date(),
  });

  beforeEach(() => {
    mockDeliveryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };

    mockCustomerRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new CreateDeliveryUseCase(mockDeliveryRepository, mockCustomerRepository);
  });

  it('should create delivery successfully when customer exists and input is valid', async () => {
    mockCustomerRepository.findById.mockResolvedValue(dummyCustomer);
    mockDeliveryRepository.create.mockImplementation(async (delivery) => delivery);

    const result = await useCase.execute(input);

    expect(result.isSuccess).toBe(true);
    const created = result.getValue();
    expect(created.customerId).toBe(input.customerId);
    expect(created.address).toBe(input.address);
    expect(created.city).toBe(input.city);
    expect(created.region).toBe(input.region);
    expect(created.postalCode).toBe(input.postalCode);
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(input.customerId);
    expect(mockDeliveryRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should fail with CustomerNotFoundError when customerId does not exist', async () => {
    mockCustomerRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(input);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(CustomerNotFoundError);
    expect(result.getError().code).toBe('CUSTOMER_NOT_FOUND');
    expect(mockCustomerRepository.findById).toHaveBeenCalledWith(input.customerId);
    expect(mockDeliveryRepository.create).not.toHaveBeenCalled();
  });

  it('should fail with InvalidDeliveryDataError when customerId is empty', async () => {
    const invalidInput = { ...input, customerId: '' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidDeliveryDataError);
    expect(result.getError().message).toBe('Customer ID cannot be empty');
    expect(mockCustomerRepository.findById).not.toHaveBeenCalled();
    expect(mockDeliveryRepository.create).not.toHaveBeenCalled();
  });

  it('should fail with InvalidDeliveryDataError when address is empty', async () => {
    const invalidInput = { ...input, address: '   ' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidDeliveryDataError);
    expect(result.getError().message).toBe('Address cannot be empty');
  });

  it('should fail with InvalidDeliveryDataError when city is empty', async () => {
    const invalidInput = { ...input, city: '' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidDeliveryDataError);
    expect(result.getError().message).toBe('City cannot be empty');
  });

  it('should fail with InvalidDeliveryDataError when region is empty', async () => {
    const invalidInput = { ...input, region: '' };

    const result = await useCase.execute(invalidInput);

    expect(result.isFailure).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidDeliveryDataError);
    expect(result.getError().message).toBe('Region cannot be empty');
  });
});
