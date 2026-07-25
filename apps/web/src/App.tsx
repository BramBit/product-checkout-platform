import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { ProductPage } from './features/product/ProductPage';
import { CheckoutFormModal } from './features/checkout/CheckoutFormModal';

function AppContent() {
  return (
    <>
      <ProductPage />
      <CheckoutFormModal />
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


