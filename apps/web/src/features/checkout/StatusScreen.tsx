import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setTransactionStatus, resetCheckout } from './checkoutSlice';
import { fetchProducts } from '../product/productSlice';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import { getTransactionStatus } from '../../services/api';
import styles from './StatusScreen.module.css';

export const StatusScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.checkout);
  const products = useAppSelector((state) => state.products);

  const [wompiDetail, setWompiDetail] = useState<string | null>(null);
  const [isMaxAttemptsReached, setIsMaxAttemptsReached] = useState(false);

  const attemptsRef = useRef(0);

  const selectedProduct = products.items?.find(
    (p) => p.id === products.selectedProductId
  ) || products.items?.[0];

  useEffect(() => {
    if (checkout.step !== 'STATUS') return;
    if (checkout.transactionStatus !== 'PENDING') return;

    attemptsRef.current = 0;
    setIsMaxAttemptsReached(false);

    const intervalId = setInterval(async () => {
      attemptsRef.current += 1;

      try {
        if (!checkout.transactionId) return;

        const updatedTx = await getTransactionStatus(checkout.transactionId);

        if (updatedTx.wompiStatusDetail) {
          setWompiDetail(updatedTx.wompiStatusDetail);
        }

        if (updatedTx.status !== 'PENDING') {
          dispatch(setTransactionStatus(updatedTx.status));
          clearInterval(intervalId);
        } else if (attemptsRef.current >= 15) {
          clearInterval(intervalId);
          setIsMaxAttemptsReached(true);
        }
      } catch {
        if (attemptsRef.current >= 15) {
          clearInterval(intervalId);
          setIsMaxAttemptsReached(true);
        }
      }
    }, 1500);

    return () => {
      clearInterval(intervalId);
    };
  }, [checkout.step, checkout.transactionId, checkout.transactionStatus, dispatch]);

  if (checkout.step !== 'STATUS') return null;

  const handleReturnToStore = () => {
    dispatch(resetCheckout());
    dispatch(fetchProducts());
  };

  const isPending = checkout.transactionStatus === 'PENDING' && !isMaxAttemptsReached;
  const isApproved = checkout.transactionStatus === 'APPROVED';
  const isDeclinedOrError =
    checkout.transactionStatus === 'DECLINED' ||
    checkout.transactionStatus === 'ERROR' ||
    isMaxAttemptsReached;

  return (
    <div className={styles.container}>
      <Card className={styles.statusCard}>
        {isPending && (
          <div className={styles.centerBox}>
            <Spinner size="lg" variant="dark" />
            <h3 className={styles.titlePending}>Confirmando tu pago...</h3>
            <p>Por favor espera un momento mientras procesamos la transacción.</p>
          </div>
        )}

        {isApproved && (
          <div className={styles.centerBox}>
            <div className={styles.iconSuccess} aria-label="Éxito">
              <span className={styles.checkMark} />
            </div>
            <h2 className={styles.titleSuccess}>¡Pago Aprobado!</h2>
            <p>Tu transacción se procesó exitosamente.</p>

            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>ID de Transacción:</span>
                <strong>{checkout.transactionId}</strong>
              </div>
              {selectedProduct && (
                <div className={styles.detailRow}>
                  <span>Producto:</span>
                  <strong>
                    {selectedProduct.name} (x{checkout.quantity})
                  </strong>
                </div>
              )}
            </div>
          </div>
        )}

        {isDeclinedOrError && (
          <div className={styles.centerBox}>
            <div className={styles.iconError} aria-label="Error">
              <span className={styles.xMark} />
            </div>
            <h2 className={styles.titleError}>No se pudo procesar el pago</h2>
            <p>
              {isMaxAttemptsReached
                ? 'Estamos confirmando tu pago, por favor verifica más tarde'
                : 'La transacción fue rechazada o presentó un error.'}
            </p>

            {wompiDetail && (
              <div className={styles.wompiDetail}>
                Detalle: {wompiDetail}
              </div>
            )}
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="primary" onClick={handleReturnToStore}>
            Volver a la tienda
          </Button>
        </div>
      </Card>
    </div>
  );
};
