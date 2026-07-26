import { DeliveriesController } from './deliveries.controller';
import { CreateDeliveryUseCase, GetDeliveryByIdUseCase } from '../../application/use-cases/create-delivery.use-case';
import { Result } from '../../../../shared/kernel/result';
import { Delivery } from '../../domain/entities/delivery.entity';
import { DeliveryNotFoundError, InvalidDeliveryDataError } from '../../../../shared/kernel/domain-errors';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;
  let createDeliveryUseCase: jest.Mocked<CreateDeliveryUseCase>;
  let getDeliveryByIdUseCase: jest.Mocked<GetDeliveryByIdUseCase>;

  const mockDelivery = Delivery.create({
    id: 'del-123',
    customerId: 'cust-123',
    address: 'Calle 123 # 45 - 67',
    city: 'Bogotá',
    region: 'Cundinamarca',
    postalCode: '110111',
  });

  beforeEach(() => {
    createDeliveryUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CreateDeliveryUseCase>;

    getDeliveryByIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetDeliveryByIdUseCase>;

    controller = new DeliveriesController(createDeliveryUseCase, getDeliveryByIdUseCase);
  });

  describe('createDelivery', () => {
    it('should call CreateDeliveryUseCase.execute and return delivery DTO', async () => {
      const dto = {
        customerId: 'cust-123',
        address: 'Calle 123 # 45 - 67',
        city: 'Bogotá',
        region: 'Cundinamarca',
        postalCode: '110111',
      };
      createDeliveryUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

      const result = await controller.createDelivery(dto);

      expect(createDeliveryUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result.id).toBe('del-123');
      expect(result.address).toBe('Calle 123 # 45 - 67');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new InvalidDeliveryDataError('Invalid address');
      createDeliveryUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.createDelivery({} as any);
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });

  describe('getDeliveryById', () => {
    it('should call GetDeliveryByIdUseCase.execute with correct ID and return delivery DTO', async () => {
      getDeliveryByIdUseCase.execute.mockResolvedValue(Result.ok(mockDelivery));

      const result = await controller.getDeliveryById('del-123');

      expect(getDeliveryByIdUseCase.execute).toHaveBeenCalledWith('del-123');
      expect(result.id).toBe('del-123');
    });

    it('should rethrow DomainError when Result is failure', async () => {
      const error = new DeliveryNotFoundError('Delivery not found');
      getDeliveryByIdUseCase.execute.mockResolvedValue(Result.fail(error));

      try {
        await controller.getDeliveryById('invalid-id');
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err).toBe(error);
      }
    });
  });
});
