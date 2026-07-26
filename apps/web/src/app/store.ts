import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import checkoutReducer from '../features/checkout/checkoutSlice';
import productsReducer from '../features/product/productSlice';

const storage = {
  getItem: (key: string): Promise<string | null> => {
    return Promise.resolve(window.localStorage.getItem(key));
  },
  setItem: (key: string, value: string): Promise<void> => {
    window.localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    window.localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'checkout-platform',
  storage,
  whitelist: ['checkout'],
};

const rootReducer = combineReducers({
  checkout: checkoutReducer,
  products: productsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
