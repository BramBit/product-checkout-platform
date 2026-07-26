import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { SummaryBackdrop } from './SummaryBackdrop';
import checkoutReducer, {
  setStep,
  setCardData,
  setDeliveryForm,
  setQuantity,
} from './checkoutSlice';
import productReducer, { setSelectedProduct } from '../product/productSlice';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createTestStore = () => {
  const store = configureStore({
    reducer: combineReducers({
      checkout: checkoutReducer,
      products: productReducer,
    }),
  });

  // Seed initial state required for SummaryBackdrop
  store.dispatch(
    setSelectedProduct('prod-1')
  );
  // Inject mock product into state
  store.dispatch({
    type: 'products/fetchProducts/fulfilled',
    payload: [
      {
        id: 'prod-1',
        name: 'Mochila Tech',
        description: 'Mochila para laptop',
        priceInCents: 10000000, // 100.000 COP
        stockQuantity: 10,
        imageUrl: null,
      },
    ],
  });

  store.dispatch(setQuantity(2));
  store.dispatch(
    setCardData({
      cardToken: 'tok_test_123',
      last4: '4242',
      brand: 'VISA',
    })
  );
  store.dispatch(
    setDeliveryForm({
      fullName: 'Carlos Gómez',
      email: 'carlos@test.com',
      phone: '3101234567',
      documentId: '987654321',
      address: 'Carrera 7 # 32 - 10',
      city: 'Medellín',
      region: 'Antioquia',
      postalCode: '050001',
    })
  );
  store.dispatch(setStep('SUMMARY'));

  return store;
};

describe('SummaryBackdrop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays breakdown and total sum correctly', () => {
    const store = createTestStore();

    render(
      <Provider store={store}>
        <SummaryBackdrop />
      </Provider>
    );

    expect(screen.getByText(/mochila tech \(x2\)/i)).toBeInTheDocument();
    // Subtotal 200.000 + Base 5.000 + Delivery 8.000 = 213.000 COP
    expect(screen.getByText(/213\.000/)).toBeInTheDocument();
    expect(screen.getByText(/4242/)).toBeInTheDocument();
    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('calls createCustomer, createDelivery, and createTransaction in sequence and dispatches setStep("STATUS")', async () => {
    vi.spyOn(api, 'createCustomer').mockResolvedValue({ id: 'cust-100' });
    vi.spyOn(api, 'createDelivery').mockResolvedValue({ id: 'del-200' });
    vi.spyOn(api, 'createTransaction').mockResolvedValue({
      id: 'tx-300',
      productId: 'prod-1',
      customerId: 'cust-100',
      deliveryId: 'del-200',
      quantity: 2,
      productAmountInCents: 20000000,
      baseFeeInCents: 500000,
      deliveryFeeInCents: 800000,
      totalAmountInCents: 21300000,
      status: 'PENDING',
      wompiTransactionId: null,
      wompiStatusDetail: null,
      createdAt: '2026-07-25T00:00:00Z',
      updatedAt: '2026-07-25T00:00:00Z',
    });

    const store = createTestStore();

    render(
      <Provider store={store}>
        <SummaryBackdrop />
      </Provider>
    );

    const confirmBtn = screen.getByRole('button', { name: /confirmar pago/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(api.createCustomer).toHaveBeenCalledWith({
        fullName: 'Carlos Gómez',
        email: 'carlos@test.com',
        phone: '3101234567',
        documentId: '987654321',
      });
      expect(api.createDelivery).toHaveBeenCalledWith({
        customerId: 'cust-100',
        address: 'Carrera 7 # 32 - 10',
        city: 'Medellín',
        region: 'Antioquia',
        postalCode: '050001',
      });
      expect(api.createTransaction).toHaveBeenCalledWith({
        productId: 'prod-1',
        quantity: 2,
        customerId: 'cust-100',
        deliveryId: 'del-200',
        cardToken: 'tok_test_123',
        installments: 1,
        customerEmail: 'carlos@test.com',
      });
    });

    const state = store.getState().checkout;
    expect(state.customerId).toBe('cust-100');
    expect(state.deliveryId).toBe('del-200');
    expect(state.transactionId).toBe('tx-300');
    expect(state.transactionStatus).toBe('PENDING');
    expect(state.step).toBe('STATUS');
  });

  it('displays error message and stays on SUMMARY if createTransaction fails', async () => {
    vi.spyOn(api, 'createCustomer').mockResolvedValue({ id: 'cust-100' });
    vi.spyOn(api, 'createDelivery').mockResolvedValue({ id: 'del-200' });
    vi.spyOn(api, 'createTransaction').mockRejectedValue(
      new Error('Fondos insuficientes')
    );

    const store = createTestStore();

    render(
      <Provider store={store}>
        <SummaryBackdrop />
      </Provider>
    );

    const confirmBtn = screen.getByRole('button', { name: /confirmar pago/i });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText('Fondos insuficientes')).toBeInTheDocument();

    const state = store.getState().checkout;
    expect(state.step).toBe('SUMMARY');
  });

  it('displays error and does NOT call createTransaction when createCustomer succeeds but createDelivery fails', async () => {
    vi.spyOn(api, 'createCustomer').mockResolvedValue({ id: 'cust-100' });
    vi.spyOn(api, 'createDelivery').mockRejectedValue(new Error('Error al crear dirección de entrega'));
    const createTxSpy = vi.spyOn(api, 'createTransaction');

    const store = createTestStore();

    render(
      <Provider store={store}>
        <SummaryBackdrop />
      </Provider>
    );

    const confirmBtn = screen.getByRole('button', { name: /confirmar pago/i });
    fireEvent.click(confirmBtn);

    expect(await screen.findByText('Error al crear dirección de entrega')).toBeInTheDocument();
    expect(createTxSpy).not.toHaveBeenCalled();

    const state = store.getState().checkout;
    expect(state.step).toBe('SUMMARY');
  });
});
