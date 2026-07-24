import { Module } from '@nestjs/common';
import { DELIVERY_REPOSITORY_PORT } from './domain/ports/delivery-repository.port';
import { PostgresDeliveryRepository } from './infrastructure/persistence/postgres-delivery.repository';
import { CreateDeliveryUseCase, GetDeliveryByIdUseCase } from './application/use-cases/create-delivery.use-case';
import { DeliveriesController } from './infrastructure/http/deliveries.controller';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [CustomersModule],
  controllers: [DeliveriesController],
  providers: [
    {
      provide: DELIVERY_REPOSITORY_PORT,
      useClass: PostgresDeliveryRepository,
    },
    CreateDeliveryUseCase,
    GetDeliveryByIdUseCase,
  ],
  exports: [
    DELIVERY_REPOSITORY_PORT,
    CreateDeliveryUseCase,
    GetDeliveryByIdUseCase,
  ],
})
export class DeliveriesModule {}
