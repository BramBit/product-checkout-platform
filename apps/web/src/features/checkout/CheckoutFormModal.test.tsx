import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { CheckoutFormModal } from './CheckoutFormModal';
import checkoutReducer, { setStep } from './checkoutSlice';
import productReducer from '../product/productSlice';
import * as wompiService from '../../services/wompiService';

vi.mock('../../services/wompiService');

const createTestStore = () =>
  configureStore({
    reducer: combineReducers({
      checkout: checkoutReducer,
      products: productReducer,
    }),
  });

describe('CheckoutFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps "Continuar" button disabled when required fields are empty', () => {
    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    const submitBtn = screen.getByRole('button', { name: /continuar/i });
    expect(submitBtn).toBeDisabled();
  });

  it('shows "Número de tarjeta inválido" when card number fails Luhn check', () => {
    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    const cardInput = screen.getByLabelText(/número de tarjeta/i);
    fireEvent.change(cardInput, { target: { value: '1234123412341234' } });
    fireEvent.blur(cardInput);

    expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument();
  });

  it('detects and displays "VISA" badge when card number starts with 4', () => {
    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    const cardInput = screen.getByLabelText(/número de tarjeta/i);
    fireEvent.change(cardInput, { target: { value: '4242424242424242' } });

    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('calls tokenizeCard with correct data and dispatches setStep("SUMMARY") when form is valid', async () => {
    vi.spyOn(wompiService, 'tokenizeCard').mockResolvedValue('token-123456');

    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    // Section 1
    fireEvent.change(screen.getByLabelText(/número de tarjeta/i), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByLabelText(/mes exp/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/año exp/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/cvc/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/nombre del titular/i), {
      target: { value: 'Juan Pérez' },
    });

    // Section 2
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'juan@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/documento de identidad/i), {
      target: { value: '123456789' },
    });
    fireEvent.change(screen.getByLabelText(/dirección de residencia/i), {
      target: { value: 'Calle 100 # 15 - 20' },
    });
    fireEvent.change(screen.getByLabelText(/ciudad/i), {
      target: { value: 'Bogotá' },
    });
    fireEvent.change(screen.getByLabelText(/departamento \/ región/i), {
      target: { value: 'Cundinamarca' },
    });

    const submitBtn = screen.getByRole('button', { name: /continuar/i });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(wompiService.tokenizeCard).toHaveBeenCalledWith({
        number: '4242 4242 4242 4242',
        expMonth: '12',
        expYear: '30',
        cvc: '123',
        cardHolder: 'Juan Pérez',
      });
    });

    const state = store.getState().checkout;
    expect(state.cardData).toEqual({
      cardToken: 'token-123456',
      last4: '4242',
      brand: 'VISA',
    });
    expect(state.step).toBe('SUMMARY');
  });

  it('displays error banner and stays on CHECKOUT_FORM if tokenizeCard fails', async () => {
    vi.spyOn(wompiService, 'tokenizeCard').mockRejectedValue(
      new Error('No pudimos validar tu tarjeta, verifica los datos e intenta de nuevo.')
    );

    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    // Section 1
    fireEvent.change(screen.getByLabelText(/número de tarjeta/i), {
      target: { value: '4242424242424242' },
    });
    fireEvent.change(screen.getByLabelText(/mes exp/i), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText(/año exp/i), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText(/cvc/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/nombre del titular/i), {
      target: { value: 'Juan Pérez' },
    });

    // Section 2
    fireEvent.change(screen.getByLabelText(/nombre completo/i), {
      target: { value: 'Juan Pérez' },
    });
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'juan@ejemplo.com' },
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '3001234567' },
    });
    fireEvent.change(screen.getByLabelText(/documento de identidad/i), {
      target: { value: '123456789' },
    });
    fireEvent.change(screen.getByLabelText(/dirección de residencia/i), {
      target: { value: 'Calle 100 # 15 - 20' },
    });
    fireEvent.change(screen.getByLabelText(/ciudad/i), {
      target: { value: 'Bogotá' },
    });
    fireEvent.change(screen.getByLabelText(/departamento \/ región/i), {
      target: { value: 'Cundinamarca' },
    });

    const submitBtn = screen.getByRole('button', { name: /continuar/i });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText(
        'No pudimos validar tu tarjeta, verifica los datos e intenta de nuevo.'
      )
    ).toBeInTheDocument();

    const state = store.getState().checkout;
    expect(state.step).toBe('CHECKOUT_FORM');
  });

  it('shows error message when expiry date is invalid (past month of current year)', () => {
    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    const monthInput = screen.getByLabelText(/mes exp/i);
    const yearInput = screen.getByLabelText(/año exp/i);

    // Current year in YY format
    const currentYearYY = new Date().getFullYear().toString().slice(-2);

    fireEvent.change(monthInput, { target: { value: '01' } });
    fireEvent.change(yearInput, { target: { value: currentYearYY } });
    fireEvent.blur(yearInput);

    expect(screen.getAllByText('Fecha inválida')).toHaveLength(2);
  });

  it('renders card input state without brand badge when card brand is UNKNOWN', () => {
    const store = createTestStore();
    store.dispatch(setStep('CHECKOUT_FORM'));

    render(
      <Provider store={store}>
        <CheckoutFormModal />
      </Provider>
    );

    const cardInput = screen.getByLabelText(/número de tarjeta/i);
    fireEvent.change(cardInput, { target: { value: '370000000000000' } });

    expect(screen.queryByText('VISA')).not.toBeInTheDocument();
    expect(screen.queryByText('MASTERCARD')).not.toBeInTheDocument();
  });
});
