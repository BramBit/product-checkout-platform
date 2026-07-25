import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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
});
