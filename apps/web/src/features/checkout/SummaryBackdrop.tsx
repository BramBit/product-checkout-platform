import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setStep,
  setCustomerId,
  setDeliveryId,
  setTransactionId,
  setTransactionStatus,
  setErrorMessage,
} from './checkoutSlice';
import { Modal } from '../../components/ui/Modal/Modal';
import { Button } from '../../components/ui/Button/Button';
import { BASE_FEE_CENTS, DELIVERY_FEE_CENTS } from '../../utils/fees';
import {
  createCustomer,
  createDelivery,
  createTransaction,
} from '../../services/api';
import styles from './SummaryBackdrop.module.css';

export const SummaryBackdrop: React.FC = () => {
  const dispatch = useAppDispatch();
  const checkout = useAppSelector((state) => state.checkout);
  const products = useAppSelector((state) => state.products);

  const [isLoading, setIsLoading] = useState(false);

  const isOpen = checkout.step === 'SUMMARY';

  const selectedProduct = products.items.find(
    (p) => p.id === products.selectedProductId
  ) || products.items[0];

  const handleClose = () => {
    dispatch(setStep('CHECKOUT_FORM'));
  };

  if (!selectedProduct || !checkout.cardData || !checkout.deliveryForm) {
    return null;
  }

  const quantity = checkout.quantity;
  const productSubtotalInCents = selectedProduct.priceInCents * quantity;
  const totalAmountInCents =
    productSubtotalInCents + BASE_FEE_CENTS + DELIVERY_FEE_CENTS;

  const formatCOP = (amountInCents: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(amountInCents / 100);

  const handleConfirmPayment = async () => {
    if (isLoading) return;

    setIsLoading(true);
    dispatch(setErrorMessage(null));

    try {
      // Step a: Create Customer
      const customer = await createCustomer({
        fullName: checkout.deliveryForm!.fullName,
        email: checkout.deliveryForm!.email,
        phone: checkout.deliveryForm!.phone,
        documentId: checkout.deliveryForm!.documentId,
      });
      dispatch(setCustomerId(customer.id));

      // Step b: Create Delivery
      const delivery = await createDelivery({
        customerId: customer.id,
        address: checkout.deliveryForm!.address,
        city: checkout.deliveryForm!.city,
        region: checkout.deliveryForm!.region,
        postalCode: checkout.deliveryForm!.postalCode,
      });
      dispatch(setDeliveryId(delivery.id));

      // Step c: Create Transaction
      const transaction = await createTransaction({
        productId: selectedProduct.id,
        quantity,
        customerId: customer.id,
        deliveryId: delivery.id,
        cardToken: checkout.cardData!.cardToken!,
        installments: 1,
        customerEmail: checkout.deliveryForm!.email,
      });

      // Step d: Update Transaction state
      dispatch(setTransactionId(transaction.id));
      dispatch(setTransactionStatus(transaction.status));

      // Step e: Advance to STATUS
      dispatch(setStep('STATUS'));
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocurrió un error al procesar tu pago. Por favor intenta de nuevo.';
      dispatch(setErrorMessage(message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Resumen de la Compra">
      <div className={styles.container}>
        {checkout.errorMessage && (
          <div className={styles.errorBanner}>{checkout.errorMessage}</div>
        )}

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Producto seleccionado</h4>
          <div className={styles.itemRow}>
            <span className={styles.itemName}>
              {selectedProduct.name} (x{quantity})
            </span>
            <span>{formatCOP(productSubtotalInCents)}</span>
          </div>
        </div>

        <div className={styles.breakdown}>
          <div className={styles.itemRow}>
            <span>Producto:</span>
            <span>{formatCOP(productSubtotalInCents)}</span>
          </div>
          <div className={styles.itemRow}>
            <span>Tarifa base:</span>
            <span>{formatCOP(BASE_FEE_CENTS)}</span>
          </div>
          <div className={styles.itemRow}>
            <span>Tarifa de envío:</span>
            <span>{formatCOP(DELIVERY_FEE_CENTS)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Total a pagar:</span>
            <span>{formatCOP(totalAmountInCents)}</span>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Método de pago</h4>
          <div className={styles.cardSummary}>
            <span>Tarjeta terminado en **** {checkout.cardData.last4}</span>
            {checkout.cardData.brand && (
              <span
                className={`${styles.brandBadge} ${
                  checkout.cardData.brand === 'VISA'
                    ? styles.visa
                    : checkout.cardData.brand === 'MASTERCARD'
                    ? styles.mastercard
                    : ''
                }`}
              >
                {checkout.cardData.brand}
              </span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPayment}
            isLoading={isLoading}
            disabled={isLoading}
          >
            Confirmar pago
          </Button>
        </div>
      </div>
    </Modal>
  );
};
