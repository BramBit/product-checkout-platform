import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/kernel/result';
import { InvalidDeliveryDataError, CustomerNotFoundError, DeliveryNotFoundError } from '../../../../shared/kernel/domain-errors';
import { Delivery } from '../../domain/entities/delivery.entity';
import { type DeliveryRepositoryPort, DELIVERY_REPOSITORY_PORT } from '../../domain/ports/delivery-repository.port';
import { type CustomerRepositoryPort, CUSTOMER_REPOSITORY_PORT } from '../../../customers/domain/ports/customer-repository.port';
import { randomUUID } from 'crypto';

export interface CreateDeliveryInput {
  customerId: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepository: DeliveryRepositoryPort,
    @Inject(CUSTOMER_REPOSITORY_PORT)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(input: CreateDeliveryInput): Promise<Result<Delivery, InvalidDeliveryDataError | CustomerNotFoundError>> {
    if (!input.customerId || input.customerId.trim() === '') {
      return Result.fail(new InvalidDeliveryDataError('Customer ID cannot be empty'));
    }

    if (!input.address || input.address.trim() === '') {
      return Result.fail(new InvalidDeliveryDataError('Address cannot be empty'));
    }

    if (!input.city || input.city.trim() === '') {
      return Result.fail(new InvalidDeliveryDataError('City cannot be empty'));
    }

    if (!input.region || input.region.trim() === '') {
      return Result.fail(new InvalidDeliveryDataError('Region cannot be empty'));
    }

    const customerExists = await this.customerRepository.findById(input.customerId);
    if (!customerExists) {
      return Result.fail(new CustomerNotFoundError(`Customer with id ${input.customerId} not found`));
    }

    const delivery = Delivery.create({
      id: randomUUID(),
      customerId: input.customerId,
      address: input.address,
      city: input.city,
      region: input.region,
      postalCode: input.postalCode,
      createdAt: new Date(),
    });

    const createdDelivery = await this.deliveryRepository.create(delivery);
    return Result.ok(createdDelivery);
  }
}

@Injectable()
export class GetDeliveryByIdUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_PORT)
    private readonly deliveryRepository: DeliveryRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Delivery, DeliveryNotFoundError>> {
    const delivery = await this.deliveryRepository.findById(id);
    if (!delivery) {
      return Result.fail(new DeliveryNotFoundError(`Delivery with id ${id} not found`));
    }
    return Result.ok(delivery);
  }
}
