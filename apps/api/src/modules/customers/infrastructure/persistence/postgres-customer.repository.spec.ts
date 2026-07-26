import { Pool } from 'pg';
import { PostgresCustomerRepository } from './postgres-customer.repository';
import { Customer } from '../../domain/entities/customer.entity';

describe('PostgresCustomerRepository', () => {
  let repository: PostgresCustomerRepository;
  let pool: jest.Mocked<Pool>;

  const mockCustomerRow = {
    id: 'cust-1',
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    document_id: 'DOC123',
    created_at: new Date('2026-01-01T00:00:00Z'),
  };

  const mockCustomer = Customer.create({
    id: 'cust-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    documentId: 'DOC123',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });

  beforeEach(() => {
    pool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    repository = new PostgresCustomerRepository(pool);
  });

  describe('findByEmail', () => {
    it('should query customer by email and return Customer entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockCustomerRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const customer = await repository.findByEmail('john@example.com');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, full_name, email, phone, document_id, created_at FROM customers WHERE email = $1',
        ['john@example.com'],
      );
      expect(customer).toBeInstanceOf(Customer);
      expect(customer?.email).toBe('john@example.com');
    });

    it('should return null when customer not found by email', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const customer = await repository.findByEmail('notfound@example.com');

      expect(customer).toBeNull();
    });
  });

  describe('findById', () => {
    it('should query customer by id and return Customer entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockCustomerRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const customer = await repository.findById('cust-1');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, full_name, email, phone, document_id, created_at FROM customers WHERE id = $1',
        ['cust-1'],
      );
      expect(customer).toBeInstanceOf(Customer);
      expect(customer?.id).toBe('cust-1');
    });

    it('should return null when customer not found by id', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const customer = await repository.findById('non-existent');

      expect(customer).toBeNull();
    });
  });

  describe('create', () => {
    it('should insert customer and return created Customer entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockCustomerRow],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const createdCustomer = await repository.create(mockCustomer);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO customers (id, full_name, email, phone, document_id, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, full_name, email, phone, document_id, created_at',
        [
          mockCustomer.id,
          mockCustomer.fullName,
          mockCustomer.email,
          mockCustomer.phone,
          mockCustomer.documentId,
          mockCustomer.createdAt,
        ],
      );
      expect(createdCustomer).toBeInstanceOf(Customer);
      expect(createdCustomer.id).toBe('cust-1');
    });
  });
});
