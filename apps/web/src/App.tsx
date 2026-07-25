import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';
import { useAppSelector } from './app/hooks';
import { ProductPage } from './features/product/ProductPage';

function AppContent() {
  const step = useAppSelector((state) => state.checkout.step);

  if (step === 'PRODUCT') {
    return <ProductPage />;
  }

  return <div>App con estado persistido listo</div>;
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


