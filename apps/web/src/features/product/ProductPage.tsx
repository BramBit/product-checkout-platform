import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProducts, setSelectedProduct } from './productSlice';
import { setQuantity, setStep } from '../checkout/checkoutSlice';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { Spinner } from '../../components/ui/Spinner/Spinner';
import styles from './ProductPage.module.css';

export const ProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.products);
  const quantity = useAppSelector((state) => state.checkout.quantity);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.centerState}>
          <Spinner size="lg" variant="dark" />
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className={styles.container}>
        <div className={styles.centerState}>
          <p className={styles.errorMessage}>
            {error || 'Error al cargar productos.'}
          </p>
          <Button
            variant="secondary"
            onClick={() => dispatch(fetchProducts())}
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const product = items[0];

  if (!product) {
    return (
      <div className={styles.container}>
        <div className={styles.centerState}>
          <p>No hay productos disponibles.</p>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(product.priceInCents / 100);

  const isOutOfStock = product.stockQuantity <= 0;

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      dispatch(setQuantity(quantity - 1));
    }
  };

  const handleIncreaseQuantity = () => {
    if (quantity < product.stockQuantity) {
      dispatch(setQuantity(quantity + 1));
    }
  };

  const handleCheckoutClick = () => {
    dispatch(setSelectedProduct(product.id));
    dispatch(setStep('CHECKOUT_FORM'));
  };

  return (
    <div className={styles.container}>
      <Card className={styles.productCard}>
        <div className={styles.grid}>
          <div className={styles.imageWrapper}>
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className={styles.productImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>
                <div className={styles.placeholderIcon}>🛍️</div>
                <span>Sin imagen</span>
              </div>
            )}
          </div>

          <div className={styles.details}>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.description}>{product.description}</p>
            <div className={styles.price}>{formattedPrice}</div>

            <div
              className={`${styles.stock} ${
                isOutOfStock
                  ? styles.outOfStock
                  : product.stockQuantity <= 5
                  ? styles.lowStock
                  : styles.inStock
              }`}
            >
              {isOutOfStock
                ? 'Agotado'
                : `${product.stockQuantity} unidades disponibles`}
            </div>

            {!isOutOfStock && (
              <div className={styles.quantitySelector}>
                <span className={styles.quantityLabel}>Cantidad:</span>
                <div className={styles.quantityControls}>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className={styles.quantityInput}>{quantity}</span>
                  <button
                    type="button"
                    className={styles.quantityBtn}
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= product.stockQuantity}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <Button
                variant="primary"
                disabled={isOutOfStock}
                onClick={handleCheckoutClick}
              >
                Pagar con tarjeta de crédito
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
