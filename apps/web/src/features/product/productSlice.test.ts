import { describe, it, expect, vi } from 'vitest';
import productReducer, { fetchProducts } from './productSlice';
import * as api from '../../services/api';

vi.mock('../../services/api');

describe('productSlice', () => {
  it('sets status to failed and populates error when fetchProducts is rejected', async () => {
    vi.spyOn(api, 'getProducts').mockRejectedValue(new Error('Network failure'));

    const initialState = {
      items: [],
      selectedProductId: null,
      status: 'idle' as const,
      error: null,
    };

    const dispatch = vi.fn();
    const getState = vi.fn();

    const thunk = fetchProducts();
    const result = await thunk(dispatch, getState, undefined);

    const nextState = productReducer(initialState, result);

    expect(nextState.status).toBe('failed');
    expect(nextState.error).toBe('Network failure');
  });
});
