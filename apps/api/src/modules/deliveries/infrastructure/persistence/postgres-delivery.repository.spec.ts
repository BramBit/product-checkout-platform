import { Pool } from 'pg';
import { PostgresDeliveryRepository } from './postgres-delivery.repository';
import { Delivery } from '../../domain/entities/delivery.entity';

describe('PostgresDeliveryRepository', () => {
  let repository: PostgresDeliveryRepository;
  let pool: jest.Mocked<Pool>;

  const mockDeliveryRow = {
    id: 'del-1',
    customer_id: 'cust-1',
    address: 'Calle 123',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postal_code: '110111',
    created_at: new Date('2026-01-01T00:00:00Z'),
  };

  const mockDelivery = Delivery.create({
    id: 'del-1',
    customerId: 'cust-1',
    address: 'Calle 123',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
    createdAt: new Date('2026-01-01T00:00:00Z'),
  });

  beforeEach(() => {
    pool = {
      query: jest.fn(),
    } as unknown as jest.Mocked<Pool>;

    repository = new PostgresDeliveryRepository(pool);
  });

  describe('create', () => {
    it('should insert delivery and return created Delivery entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockDeliveryRow],
        command: 'INSERT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await repository.create(mockDelivery);

      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO deliveries (id, customer_id, address, city, region, postal_code, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, customer_id, address, city, region, postal_code, created_at',
        [
          mockDelivery.id,
          mockDelivery.customerId,
          mockDelivery.address,
          mockDelivery.city,
          mockDelivery.region,
          mockDelivery.postalCode,
          mockDelivery.createdAt,
        ],
      );
      expect(result).toBeInstanceOf(Delivery);
      expect(result.id).toBe('del-1');
    });
  });

  describe('findById', () => {
    it('should query delivery by id and return Delivery entity', async () => {
      pool.query.mockResolvedValue({
        rows: [mockDeliveryRow],
        command: 'SELECT',
        rowCount: 1,
        oid: 0,
        fields: [],
      });

      const result = await repository.findById('del-1');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT id, customer_id, address, city, region, postal_code, created_at FROM deliveries WHERE id = $1',
        ['del-1'],
      );
      expect(result).toBeInstanceOf(Delivery);
      expect(result?.id).toBe('del-1');
    });

    it('should return null when delivery not found', async () => {
      pool.query.mockResolvedValue({
        rows: [],
        command: 'SELECT',
        rowCount: 0,
        oid: 0,
        fields: [],
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull();
    });
  });
});
