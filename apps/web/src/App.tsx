import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { ProductPage } from './features/product/ProductPage';
import { CheckoutFormModal } from './features/checkout/CheckoutFormModal';
import { SummaryBackdrop } from './features/checkout/SummaryBackdrop';
import { StatusScreen } from './features/checkout/StatusScreen';
import { useAppSelector } from './app/hooks';

function AppContent() {
  const step = useAppSelector((state) => state.checkout.step);

  if (step === 'STATUS') {
    return <StatusScreen />;
  }

  return (
    <>
      <ProductPage />
      <CheckoutFormModal />
      <SummaryBackdrop />
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;


