import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

describe('httpClient interceptors', () => {
  it('re-throws JS Error with message when response.data.error exists', async () => {
    let errorHandler: ((error: any) => Promise<never>) | undefined;
    const axiosInstance = (axios.create as any)();
    
    // Import httpClient to register interceptors
    await import('./httpClient');

    const useMock = axiosInstance.interceptors.response.use as any;
    errorHandler = useMock.mock.calls[0]?.[1];

    expect(errorHandler).toBeDefined();

    const mockErrorWithData = {
      response: {
        data: {
          error: {
            code: 'INVALID_DATA',
            message: 'Custom API error message',
          },
        },
      },
    };

    await expect(errorHandler!(mockErrorWithData)).rejects.toThrow('Custom API error message');
  });

  it('passes original error unchanged if error does NOT have response.data.error', async () => {
    const axiosInstance = (axios.create as any)();
    const useMock = axiosInstance.interceptors.response.use as any;
    const errorHandler = useMock.mock.calls[0]?.[1];

    const genericError = new Error('Network Error');
    await expect(errorHandler!(genericError)).rejects.toBe(genericError);
  });
});
