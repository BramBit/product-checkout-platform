import { DomainError } from '../domain-error';

export class ProductNotFoundError extends DomainError {
  constructor(message = 'Product not found') {
    super('PRODUCT_NOT_FOUND', message);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(message = 'Insufficient stock for product') {
    super('INSUFFICIENT_STOCK', message);
  }
}

export class CustomerNotFoundError extends DomainError {
  constructor(message = 'Customer not found') {
    super('CUSTOMER_NOT_FOUND', message);
  }
}

export class DeliveryNotFoundError extends DomainError {
  constructor(message = 'Delivery not found') {
    super('DELIVERY_NOT_FOUND', message);
  }
}

export class TransactionNotFoundError extends DomainError {
  constructor(message = 'Transaction not found') {
    super('TRANSACTION_NOT_FOUND', message);
  }
}

export class PaymentGatewayError extends DomainError {
  constructor(message = 'Payment gateway error occurred') {
    super('PAYMENT_GATEWAY_ERROR', message);
  }
}

export class InvalidCardDataError extends DomainError {
  constructor(message = 'Invalid card data provided') {
    super('INVALID_CARD_DATA', message);
  }
}

export class InvalidCustomerDataError extends DomainError {
  constructor(message = 'Invalid customer data provided') {
    super('INVALID_CUSTOMER_DATA', message);
  }
}

export class InvalidDeliveryDataError extends DomainError {
  constructor(message = 'Invalid delivery data provided') {
    super('INVALID_DELIVERY_DATA', message);
  }
}

export class InvalidTransactionDataError extends DomainError {
  constructor(message = 'Invalid transaction data provided') {
    super('INVALID_TRANSACTION_DATA', message);
  }
}


