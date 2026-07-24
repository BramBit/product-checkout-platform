import { Delivery } from './delivery.entity';

describe('Delivery Entity', () => {
  const validProps = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    customerId: '987e6543-e21b-12d3-a456-426614174000',
    address: 'Calle 123 #45-67',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
    createdAt: new Date(),
  };

  it('should create a Delivery instance correctly with Delivery.create()', () => {
    const delivery = Delivery.create(validProps);

    expect(delivery).toBeInstanceOf(Delivery);
    expect(delivery.id).toBe(validProps.id);
    expect(delivery.customerId).toBe(validProps.customerId);
    expect(delivery.address).toBe(validProps.address);
    expect(delivery.city).toBe(validProps.city);
    expect(delivery.region).toBe(validProps.region);
    expect(delivery.postalCode).toBe(validProps.postalCode);
    expect(delivery.createdAt).toBe(validProps.createdAt);
  });
});
