import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { WompiGatewayAdapter } from './wompi-gateway.adapter';
import { PaymentGatewayError } from '../../../../shared/kernel/domain-errors';
import { AxiosResponse, AxiosHeaders } from 'axios';

describe('WompiGatewayAdapter', () => {
  let adapter: WompiGatewayAdapter;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const fakeConfig = {
    WOMPI_PRIVATE_KEY: 'prv_test_key',
    WOMPI_PUBLIC_KEY: 'pub_test_key',
    WOMPI_INTEGRITY_KEY: 'integrity_test_key',
    WOMPI_API_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
  };

  beforeEach(() => {
    httpService = {
      get: jest.fn(),
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        return fakeConfig[key as keyof typeof fakeConfig] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    adapter = new WompiGatewayAdapter(httpService, configService);
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token on success', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            presigned_acceptance: {
              acceptance_token: 'fake-acceptance-token-123',
            },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const token = await adapter.getAcceptanceToken();

      expect(token).toBe('fake-acceptance-token-123');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_test_key',
      );
    });

    it('should throw PaymentGatewayError when HttpService fails', async () => {
      const axiosError = {
        response: {
          data: {
            error: {
              reason: 'Merchant not found',
            },
          },
        },
      };

      httpService.get.mockReturnValue(throwError(() => axiosError));

      try {
        await adapter.getAcceptanceToken();
        fail('Should have thrown PaymentGatewayError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(PaymentGatewayError);
      }
    });

    it('should throw PaymentGatewayError when acceptance token is missing in response', async () => {
      const mockResponse: AxiosResponse = {
        data: { data: {} },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      httpService.get.mockReturnValue(of(mockResponse));

      try {
        await adapter.getAcceptanceToken();
        fail('Should have thrown PaymentGatewayError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(PaymentGatewayError);
        expect(err.message).toBe('Failed to obtain acceptance token from Wompi response');
      }
    });
  });

  describe('createTransaction', () => {
    it('should return mapped transaction response on success', async () => {
      const params = {
        amountInCents: 500000,
        currency: 'COP',
        customerEmail: 'customer@example.com',
        cardToken: 'tok_test_card',
        installments: 1,
        reference: 'REF-12345',
        acceptanceToken: 'fake-acceptance-token',
      };

      const mockResponse: AxiosResponse = {
        data: {
          data: {
            id: 'wompi-tx-999',
            status: 'APPROVED',
            status_message: 'Transaction approved successfully',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      httpService.post.mockReturnValue(of(mockResponse));

      const result = await adapter.createTransaction(params);

      expect(result).toEqual({
        wompiTransactionId: 'wompi-tx-999',
        status: 'APPROVED',
        statusDetail: 'Transaction approved successfully',
      });
      expect(httpService.post).toHaveBeenCalledWith(
        'https://api-sandbox.co.uat.wompi.dev/v1/transactions',
        expect.objectContaining({
          amount_in_cents: params.amountInCents,
          currency: params.currency,
          customer_email: params.customerEmail,
          reference: params.reference,
          acceptance_token: params.acceptanceToken,
        }),
        {
          headers: {
            Authorization: 'Bearer prv_test_key',
          },
        },
      );
    });

    it('should throw PaymentGatewayError when HttpService throws error', async () => {
      const params = {
        amountInCents: 500000,
        currency: 'COP',
        customerEmail: 'customer@example.com',
        cardToken: 'tok_test_card',
        installments: 1,
        reference: 'REF-12345',
        acceptanceToken: 'fake-acceptance-token',
      };

      const axiosError = {
        response: {
          data: {
            message: 'Invalid card details',
          },
        },
      };

      httpService.post.mockReturnValue(throwError(() => axiosError));

      try {
        await adapter.createTransaction(params);
        fail('Should have thrown PaymentGatewayError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(PaymentGatewayError);
      }
    });
  });

  describe('getTransactionStatus', () => {
    it('should return transaction status on success', async () => {
      const wompiTransactionId = 'wompi-tx-999';
      const mockResponse: AxiosResponse = {
        data: {
          data: {
            status: 'APPROVED',
            status_message: 'Approved',
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await adapter.getTransactionStatus(wompiTransactionId);

      expect(result).toEqual({
        status: 'APPROVED',
        statusDetail: 'Approved',
      });
      expect(httpService.get).toHaveBeenCalledWith(
        `https://api-sandbox.co.uat.wompi.dev/v1/transactions/${wompiTransactionId}`,
        {
          headers: {
            Authorization: 'Bearer prv_test_key',
          },
        },
      );
    });

    it('should throw PaymentGatewayError when HttpService throws error', async () => {
      const axiosError = new Error('Network error');

      httpService.get.mockReturnValue(throwError(() => axiosError));

      try {
        await adapter.getTransactionStatus('wompi-tx-999');
        fail('Should have thrown PaymentGatewayError');
      } catch (err: any) {
        expect(err).toBeInstanceOf(PaymentGatewayError);
      }
    });
  });
});
