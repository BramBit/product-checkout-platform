import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getProducts } from '../../services/api';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stockQuantity: number;
  imageUrl: string | null;
}

interface ProductState {
  items: Product[];
  selectedProductId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  selectedProductId: null,
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk<Product[]>(
  'products/fetchProducts',
  async () => {
    return await getProducts();
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct(state, action: PayloadAction<string>) {
      state.selectedProductId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Error fetching products';
      });
  },
});

export const { setSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
