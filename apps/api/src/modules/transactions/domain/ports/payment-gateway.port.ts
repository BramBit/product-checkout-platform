export interface CreateTransactionGatewayParams {
  reference: string;
  amountInCents: number;
  currency: string;
  cardToken: string;
  acceptanceToken: string;
  customerEmail: string;
  installments: number;
}

export interface CreateTransactionGatewayResponse {
  wompiTransactionId: string;
  status: string;
  statusDetail: string | null;
}

export interface GetTransactionStatusGatewayResponse {
  status: string;
  statusDetail: string | null;
}

export interface PaymentGatewayPort {
  getAcceptanceToken(): Promise<string>;
  createTransaction(params: CreateTransactionGatewayParams): Promise<CreateTransactionGatewayResponse>;
  getTransactionStatus(wompiTransactionId: string): Promise<GetTransactionStatusGatewayResponse>;
}

export const PAYMENT_GATEWAY_PORT = Symbol('PaymentGatewayPort');
