import { describe, it, expect, vi } from 'vitest';
import { tokenizeCard } from './paymentGatewayService';
import axios from 'axios';

vi.mock('axios');

describe('paymentGatewayService', () => {
  it('returns token id on success', async () => {
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { data: { id: 'tok_123' } } });
    const token = await tokenizeCard({
      number: '4242424242424242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      cardHolder: 'Holder',
    });
    expect(token).toBe('tok_123');
  });

  it('throws custom error on failure', async () => {
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Network Error'));
    await expect(
      tokenizeCard({
        number: '4242424242424242',
        expMonth: '12',
        expYear: '30',
        cvc: '123',
        cardHolder: 'Holder',
      })
    ).rejects.toThrow('No pudimos validar tu tarjeta, verifica los datos e intenta de nuevo.');
  });
});
