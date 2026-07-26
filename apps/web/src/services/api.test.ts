import { describe, it, expect, vi } from 'vitest';
import { getProducts, getProductById, createCustomer, createDelivery, createTransaction, getTransactionStatus } from './api';
import { httpClient } from './httpClient';

vi.mock('./httpClient');

describe('api service', () => {
  it('calls getProducts correctly', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({ data: [] });
    const res = await getProducts();
    expect(res).toEqual([]);
  });

  it('calls getProductById correctly', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({ data: { id: '1' } });
    const res = await getProductById('1');
    expect(res).toEqual({ id: '1' });
  });

  it('calls createCustomer correctly', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValue({ data: { id: 'cust-1' } });
    const res = await createCustomer({ fullName: 'A', email: 'b@b.com', phone: '1234567', documentId: '123' });
    expect(res).toEqual({ id: 'cust-1' });
  });

  it('calls createDelivery correctly', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValue({ data: { id: 'del-1' } });
    const res = await createDelivery({ customerId: 'c1', address: 'A', city: 'B', region: 'C', postalCode: '1' });
    expect(res).toEqual({ id: 'del-1' });
  });

  it('calls createTransaction correctly', async () => {
    vi.spyOn(httpClient, 'post').mockResolvedValue({ data: { id: 'tx-1' } });
    const res = await createTransaction({ productId: 'p1', quantity: 1, customerId: 'c1', deliveryId: 'd1', cardToken: 't1', installments: 1, customerEmail: 'e@e.com' });
    expect(res).toEqual({ id: 'tx-1' });
  });

  it('calls getTransactionStatus correctly', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue({ data: { id: 'tx-1', status: 'APPROVED' } });
    const res = await getTransactionStatus('tx-1');
    expect(res).toEqual({ id: 'tx-1', status: 'APPROVED' });
  });
});
