import { Delivery } from '../entities/delivery.entity';

export interface DeliveryRepositoryPort {
  create(delivery: Delivery): Promise<Delivery>;
  findById(id: string): Promise<Delivery | null>;
}

export const DELIVERY_REPOSITORY_PORT = Symbol('DeliveryRepositoryPort');
