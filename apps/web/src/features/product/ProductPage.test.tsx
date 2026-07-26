import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { ProductPage } from './ProductPage';
import productReducer, { type Product } from './productSlice';
import checkoutReducer from '../checkout/checkoutSlice';
import * as api from '../../services/api';

vi.mock('../../services/api');

const createTestStore = () =>
  configureStore({
    reducer: combineReducers({
      products: productReducer,
      checkout: checkoutReducer,
    }),
  });

const mockProducts: Product[] = [
  {
    id: 'prod-123',
    name: 'Silla Gamer Ergológica',
    description: 'Excelente para largas jornadas',
    priceInCents: 50000000, // 500.000 COP
    stockQuantity: 5,
    imageUrl: 'https://example.com/silla.png',
  },
];

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders spinner while loading products', () => {
    vi.spyOn(api, 'getProducts').mockImplementation(
      () => new Promise(() => {}) // Pending promise
    );

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();
  });

  it('renders product details correctly when fetch succeeds', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts);

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    expect(await screen.findByText('Silla Gamer Ergológica')).toBeInTheDocument();
    expect(screen.getByText('Excelente para largas jornadas')).toBeInTheDocument();
    expect(screen.getByText(/500\.000/)).toBeInTheDocument();
    expect(screen.getByText('5 unidades disponibles')).toBeInTheDocument();
  });

  it('disables checkout button when stockQuantity is 0', async () => {
    const outOfStockProducts: Product[] = [
      {
        ...mockProducts[0],
        stockQuantity: 0,
      },
    ];

    vi.spyOn(api, 'getProducts').mockResolvedValue(outOfStockProducts);

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    expect(await screen.findByText('Agotado')).toBeInTheDocument();
    const payButton = screen.getByRole('button', { name: /pagar con tarjeta de crédito/i });
    expect(payButton).toBeDisabled();
  });

  it('dispatches expected actions when clicking checkout button', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue(mockProducts);

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    const payButton = await screen.findByRole('button', { name: /pagar con tarjeta de crédito/i });
    fireEvent.click(payButton);

    const state = store.getState();
    expect(state.products.selectedProductId).toBe('prod-123');
    expect(state.checkout.step).toBe('CHECKOUT_FORM');
  });

  it('dispatches fetchProducts when clicking "Reintentar" after status failed', async () => {
    vi.spyOn(api, 'getProducts').mockRejectedValue(new Error('Fetch failed'));

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    const retryBtn = await screen.findByRole('button', { name: /reintentar/i });
    expect(api.getProducts).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.click(retryBtn);
    });
    expect(api.getProducts).toHaveBeenCalledTimes(2);
  });

  it('shows message "No hay productos disponibles" when items is empty after succeeded', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue([]);

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    expect(await screen.findByText('No hay productos disponibles.')).toBeInTheDocument();
  });

  it('handles quantity selector boundaries (+ disabled at stockQuantity, - disabled at 1)', async () => {
    vi.spyOn(api, 'getProducts').mockResolvedValue([
      {
        ...mockProducts[0],
        stockQuantity: 2,
      },
    ]);

    const store = createTestStore();
    render(
      <Provider store={store}>
        <ProductPage />
      </Provider>
    );

    await screen.findByText('Silla Gamer Ergológica');

    const decreaseBtn = screen.getByRole('button', { name: 'Disminuir cantidad' });
    const increaseBtn = screen.getByRole('button', { name: 'Aumentar cantidad' });

    // Initial quantity is 1 (default state)
    expect(decreaseBtn).toBeDisabled();
    expect(increaseBtn).not.toBeDisabled();

    fireEvent.click(increaseBtn);
    expect(store.getState().checkout.quantity).toBe(2);
    expect(increaseBtn).toBeDisabled();
    expect(decreaseBtn).not.toBeDisabled();
  });
});
