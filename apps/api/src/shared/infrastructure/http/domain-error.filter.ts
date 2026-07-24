import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainError } from '../../kernel/domain-error';
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

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (
      exception instanceof ProductNotFoundError ||
      exception instanceof CustomerNotFoundError ||
      exception instanceof DeliveryNotFoundError ||
      exception instanceof TransactionNotFoundError
    ) {
      status = HttpStatus.NOT_FOUND;
    } else if (
      exception instanceof InsufficientStockError ||
      exception instanceof InvalidCardDataError ||
      exception instanceof InvalidCustomerDataError ||
      exception instanceof InvalidDeliveryDataError ||
      exception instanceof InvalidTransactionDataError
    ) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof PaymentGatewayError) {
      status = HttpStatus.BAD_GATEWAY;
    }

    response.status(status).json({
      error: {
        code: exception.code,
        message: exception.message,
      },
    });
  }
}
