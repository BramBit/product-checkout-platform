import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { StatusScreen } from './StatusScreen';
import checkoutReducer, {
  setStep,
  setTransactionId,
  setTransactionStatus,
} from './checkoutSlice';
import productReducer from '../product/productSlice';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createTestStore = () => {
  const store = configureStore({
    reducer: combineReducers({
      checkout: checkoutReducer,
      products: productReducer,
    }),
  });

  store.dispatch({
    type: 'products/fetchProducts/fulfilled',
    payload: [
      {
        id: 'prod-1',
        name: 'Mochila Tech',
        description: 'Mochila para laptop',
        priceInCents: 10000000,
        stockQuantity: 10,
        imageUrl: null,
      },
    ],
  });

  store.dispatch(setTransactionId('tx-999'));
  store.dispatch(setTransactionStatus('PENDING'));
  store.dispatch(setStep('STATUS'));

  return store;
};

describe('StatusScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders spinner while status is PENDING', () => {
    vi.spyOn(api, 'getTransactionStatus').mockResolvedValue({
      id: 'tx-999',
      productId: 'prod-1',
      customerId: 'cust-1',
      deliveryId: 'del-1',
      quantity: 1,
      productAmountInCents: 10000000,
      baseFeeInCents: 500000,
      deliveryFeeInCents: 800000,
      totalAmountInCents: 11300000,
      status: 'PENDING',
      wompiTransactionId: null,
      wompiStatusDetail: null,
      createdAt: '2026-07-25T00:00:00Z',
      updatedAt: '2026-07-25T00:00:00Z',
    });

    const store = createTestStore();

    render(
      <Provider store={store}>
        <StatusScreen />
      </Provider>
    );

    expect(screen.getByText(/confirmando tu pago/i)).toBeInTheDocument();
  });

  it('stops polling and displays success message when status becomes APPROVED', async () => {
    vi.spyOn(api, 'getTransactionStatus').mockResolvedValue({
      id: 'tx-999',
      productId: 'prod-1',
      customerId: 'cust-1',
      deliveryId: 'del-1',
      quantity: 1,
      productAmountInCents: 10000000,
      baseFeeInCents: 500000,
      deliveryFeeInCents: 800000,
      totalAmountInCents: 11300000,
      status: 'APPROVED',
      wompiTransactionId: 'wompi-123',
      wompiStatusDetail: 'APPROVED',
      createdAt: '2026-07-25T00:00:00Z',
      updatedAt: '2026-07-25T00:00:00Z',
    });

    const store = createTestStore();

    render(
      <Provider store={store}>
        <StatusScreen />
      </Provider>
    );

    // Advance 1500ms for first interval poll
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(api.getTransactionStatus).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/pago aprobado/i)).toBeInTheDocument();
    expect(screen.getByText('tx-999')).toBeInTheDocument();

    // Advance more time to confirm polling stopped
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(api.getTransactionStatus).toHaveBeenCalledTimes(1);
  });

  it('displays decline message when status becomes DECLINED and stops polling', async () => {
    vi.spyOn(api, 'getTransactionStatus').mockResolvedValue({
      id: 'tx-999',
      productId: 'prod-1',
      customerId: 'cust-1',
      deliveryId: 'del-1',
      quantity: 1,
      productAmountInCents: 10000000,
      baseFeeInCents: 500000,
      deliveryFeeInCents: 800000,
      totalAmountInCents: 11300000,
      status: 'DECLINED',
      wompiTransactionId: 'wompi-456',
      wompiStatusDetail: 'INSUFFICIENT_FUNDS',
      createdAt: '2026-07-25T00:00:00Z',
      updatedAt: '2026-07-25T00:00:00Z',
    });

    const store = createTestStore();

    render(
      <Provider store={store}>
        <StatusScreen />
      </Provider>
    );

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByText(/no se pudo procesar el pago/i)).toBeInTheDocument();
    expect(screen.getByText(/INSUFFICIENT_FUNDS/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(api.getTransactionStatus).toHaveBeenCalledTimes(1);
  });

  it('dispatches resetCheckout and fetchProducts when clicking "Volver a la tienda"', () => {
    const store = createTestStore();
    store.dispatch(setTransactionStatus('APPROVED'));

    render(
      <Provider store={store}>
        <StatusScreen />
      </Provider>
    );

    const returnBtn = screen.getByRole('button', { name: /volver a la tienda/i });
    act(() => {
      fireEvent.click(returnBtn);
    });

    const state = store.getState().checkout;
    expect(state.step).toBe('PRODUCT');
    expect(state.transactionId).toBeNull();
  });
});
