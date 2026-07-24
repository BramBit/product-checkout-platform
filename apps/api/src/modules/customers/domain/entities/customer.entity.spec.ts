import { Customer } from './customer.entity';

describe('Customer Entity', () => {
  const validProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+573001234567',
    documentId: '1234567890',
    createdAt: new Date(),
  };

  it('should create a Customer instance correctly with Customer.create()', () => {
    const customer = Customer.create(validProps);

    expect(customer).toBeInstanceOf(Customer);
    expect(customer.id).toBe(validProps.id);
    expect(customer.fullName).toBe(validProps.fullName);
    expect(customer.email).toBe(validProps.email);
    expect(customer.phone).toBe(validProps.phone);
    expect(customer.documentId).toBe(validProps.documentId);
    expect(customer.createdAt).toBe(validProps.createdAt);
  });
});
