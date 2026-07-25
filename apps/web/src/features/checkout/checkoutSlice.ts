import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type Step = 'PRODUCT' | 'CHECKOUT_FORM' | 'SUMMARY' | 'STATUS';

export interface CardData {
  cardToken: string | null;
  last4: string | null;
  brand: 'VISA' | 'MASTERCARD' | 'UNKNOWN' | null;
}

export interface DeliveryFormData {
  fullName: string;
  email: string;
  phone: string;
  documentId: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CheckoutState {
  step: Step;
  quantity: number;
  deliveryForm: DeliveryFormData | null;
  cardData: CardData | null;
  customerId: string | null;
  deliveryId: string | null;
  transactionId: string | null;
  transactionStatus: 'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | null;
  errorMessage: string | null;
}

const initialState: CheckoutState = {
  step: 'PRODUCT',
  quantity: 1,
  deliveryForm: null,
  cardData: null,
  customerId: null,
  deliveryId: null,
  transactionId: null,
  transactionStatus: null,
  errorMessage: null,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<Step>) {
      state.step = action.payload;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
    },
    setDeliveryForm(state, action: PayloadAction<DeliveryFormData | null>) {
      state.deliveryForm = action.payload;
    },
    setCardData(state, action: PayloadAction<CardData | null>) {
      state.cardData = action.payload;
    },
    setCustomerId(state, action: PayloadAction<string | null>) {
      state.customerId = action.payload;
    },
    setDeliveryId(state, action: PayloadAction<string | null>) {
      state.deliveryId = action.payload;
    },
    setTransactionId(state, action: PayloadAction<string | null>) {
      state.transactionId = action.payload;
    },
    setTransactionStatus(
      state,
      action: PayloadAction<'PENDING' | 'APPROVED' | 'DECLINED' | 'ERROR' | null>
    ) {
      state.transactionStatus = action.payload;
    },
    setErrorMessage(state, action: PayloadAction<string | null>) {
      state.errorMessage = action.payload;
    },
    resetCheckout(state) {
      state.step = 'PRODUCT';
      state.quantity = 1;
      state.deliveryForm = null;
      state.cardData = null;
      state.customerId = null;
      state.deliveryId = null;
      state.transactionId = null;
      state.transactionStatus = null;
      state.errorMessage = null;
    },
  },
});

export const {
  setStep,
  setQuantity,
  setDeliveryForm,
  setCardData,
  setCustomerId,
  setDeliveryId,
  setTransactionId,
  setTransactionStatus,
  setErrorMessage,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
