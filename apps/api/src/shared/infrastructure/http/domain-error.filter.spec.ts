import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainErrorFilter } from './domain-error.filter';
import {
  ProductNotFoundError,
  CustomerNotFoundError,
  DeliveryNotFoundError,
  TransactionNotFoundError,
  InsufficientStockError,
  InvalidCardDataError,
  InvalidCustomerDataError,
  InvalidDeliveryDataError,
  InvalidTransactionDataError,
  PaymentGatewayError,
} from '../../kernel/domain-errors';
import { DomainError } from '../../kernel/domain-error';

describe('DomainErrorFilter', () => {
  let filter: DomainErrorFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainErrorFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => ({}),
      }),
    } as unknown as ArgumentsHost;
  });

  it.each([
    { error: new ProductNotFoundError('Product not found'), expectedStatus: HttpStatus.NOT_FOUND },
    { error: new CustomerNotFoundError('Customer not found'), expectedStatus: HttpStatus.NOT_FOUND },
    { error: new DeliveryNotFoundError('Delivery not found'), expectedStatus: HttpStatus.NOT_FOUND },
    { error: new TransactionNotFoundError('Transaction not found'), expectedStatus: HttpStatus.NOT_FOUND },
    { error: new InsufficientStockError('No stock'), expectedStatus: HttpStatus.BAD_REQUEST },
    { error: new InvalidCardDataError('Bad card'), expectedStatus: HttpStatus.BAD_REQUEST },
    { error: new InvalidCustomerDataError('Bad customer'), expectedStatus: HttpStatus.BAD_REQUEST },
    { error: new InvalidDeliveryDataError('Bad delivery'), expectedStatus: HttpStatus.BAD_REQUEST },
    { error: new InvalidTransactionDataError('Bad tx'), expectedStatus: HttpStatus.BAD_REQUEST },
    { error: new PaymentGatewayError('Gateway failed'), expectedStatus: HttpStatus.BAD_GATEWAY },
    { error: new (class UnknownDomainError extends DomainError { constructor() { super('UNKNOWN_ERROR', 'Unknown'); } })(), expectedStatus: HttpStatus.INTERNAL_SERVER_ERROR },
  ])('should map $error.constructor.name to HTTP status $expectedStatus', ({ error, expectedStatus }) => {
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(expectedStatus);
  });

  it('should structure response body with { error: { code, message } }', () => {
    const error = new ProductNotFoundError('Product with ID 123 not found');

    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product with ID 123 not found',
      },
    });
  });
});
