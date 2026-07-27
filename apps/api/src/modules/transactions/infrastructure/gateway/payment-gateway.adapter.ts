import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  PaymentGatewayPort,
  CreateTransactionGatewayParams,
  CreateTransactionGatewayResponse,
  GetTransactionStatusGatewayResponse,
} from '../../domain/ports/payment-gateway.port';
import { PaymentGatewayError } from '../../../../shared/kernel/domain-errors';
import { generateIntegritySignature } from './payment-signature.util';

@Injectable()
export class PaymentGatewayAdapter implements PaymentGatewayPort {
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integrityKey: string;
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.publicKey = this.configService.get<string>('PAYMENT_GATEWAY_PUBLIC_KEY', '');
    this.privateKey = this.configService.get<string>('PAYMENT_GATEWAY_PRIVATE_KEY', '');
    this.integrityKey = this.configService.get<string>('PAYMENT_GATEWAY_INTEGRITY_KEY', '');
    this.apiUrl = this.configService.get<string>('PAYMENT_GATEWAY_API_URL', 'https://api-sandbox.co.uat.wompi.dev/v1');
  }

  async getAcceptanceToken(): Promise<string> {
    try {
      const url = `${this.apiUrl}/merchants/${this.publicKey}`;
      const response = await firstValueFrom(this.httpService.get(url));
      const acceptanceToken = response.data?.data?.presigned_acceptance?.acceptance_token;
      if (!acceptanceToken) {
        throw new PaymentGatewayError('Failed to obtain acceptance token from payment gateway response');
      }
      return acceptanceToken;
    } catch (error: any) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      const errorMessage =
        error.response?.data?.error?.reason ||
        error.response?.data?.message ||
        error.message ||
        'Error retrieving acceptance token from payment gateway';
      throw new PaymentGatewayError(errorMessage);
    }
  }

  async createTransaction(
    params: CreateTransactionGatewayParams,
  ): Promise<CreateTransactionGatewayResponse> {
    try {
      const signature = generateIntegritySignature(
        params.reference,
        params.amountInCents,
        params.currency,
        this.integrityKey,
      );

      const url = `${this.apiUrl}/transactions`;
      const body = {
        amount_in_cents: params.amountInCents,
        currency: params.currency,
        customer_email: params.customerEmail,
        payment_method: {
          type: 'CARD',
          installments: params.installments,
          token: params.cardToken,
        },
        reference: params.reference,
        acceptance_token: params.acceptanceToken,
        signature,
      };

      const response = await firstValueFrom(
        this.httpService.post(url, body, {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );

      const txData = response.data?.data;
      if (!txData) {
        throw new PaymentGatewayError('Invalid response received from payment gateway create transaction');
      }

      return {
        wompiTransactionId: txData.id,
        status: txData.status,
        statusDetail: txData.status_message ?? null,
      };
    } catch (error: any) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      const errorMessage =
        error.response?.data?.error?.reason ||
        error.response?.data?.message ||
        error.message ||
        'Error creating transaction with payment gateway';
      throw new PaymentGatewayError(errorMessage);
    }
  }

  async getTransactionStatus(
    wompiTransactionId: string,
  ): Promise<GetTransactionStatusGatewayResponse> {
    try {
      const url = `${this.apiUrl}/transactions/${wompiTransactionId}`;
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
          },
        }),
      );

      const txData = response.data?.data;
      if (!txData) {
        throw new PaymentGatewayError('Invalid response received from payment gateway get transaction status');
      }

      return {
        status: txData.status,
        statusDetail: txData.status_message ?? null,
      };
    } catch (error: any) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      const errorMessage =
        error.response?.data?.error?.reason ||
        error.response?.data?.message ||
        error.message ||
        'Error retrieving transaction status from payment gateway';
      throw new PaymentGatewayError(errorMessage);
    }
  }
}
