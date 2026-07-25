import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { setStep, setCardData, setDeliveryForm } from './checkoutSlice';
import { Modal } from '../../components/ui/Modal/Modal';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { tokenizeCard } from '../../services/wompiService';
import {
  luhnCheck,
  detectCardBrand,
  formatCardNumber,
  isValidExpiryDate,
  isValidCvc,
} from '../../utils/cardValidation';
import {
  isValidEmail,
  isNotEmpty,
  isValidPhone,
} from '../../utils/formValidation';
import styles from './CheckoutFormModal.module.css';

export const CheckoutFormModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const step = useAppSelector((state) => state.checkout.step);
  const isOpen = step === 'CHECKOUT_FORM';

  // Section 1 - Card Data State
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  // Section 2 - Delivery Data State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Submission State
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derived Validations
  const brand = detectCardBrand(cardNumber);
  const rawCardNumber = cardNumber.replace(/\D/g, '');
  const isCardNumberValid = rawCardNumber.length >= 13 && luhnCheck(cardNumber);
  const isExpiryValid = isValidExpiryDate(expMonth, expYear);
  const isCvcValid = isValidCvc(cvc);
  const isCardHolderValid = isNotEmpty(cardHolder);

  const isFullNameValid = isNotEmpty(fullName);
  const isEmailValid = isValidEmail(email);
  const isPhoneValid = isValidPhone(phone);
  const isDocumentIdValid = isNotEmpty(documentId);
  const isAddressValid = isNotEmpty(address);
  const isCityValid = isNotEmpty(city);
  const isRegionValid = isNotEmpty(region);

  const isFormValid =
    isCardNumberValid &&
    isExpiryValid &&
    isCvcValid &&
    isCardHolderValid &&
    isFullNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isDocumentIdValid &&
    isAddressValid &&
    isCityValid &&
    isRegionValid;

  const handleClose = () => {
    dispatch(setStep('PRODUCT'));
  };

  const handleCardNumberChange = (val: string) => {
    setCardNumber(formatCardNumber(val));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isLoading) return;

    setIsLoading(true);
    setSubmitError(null);

    try {
      const token = await tokenizeCard({
        number: cardNumber,
        expMonth,
        expYear,
        cvc,
        cardHolder,
      });

      const last4 = rawCardNumber.slice(-4);

      dispatch(
        setCardData({
          cardToken: token,
          last4,
          brand,
        })
      );

      dispatch(
        setDeliveryForm({
          fullName,
          email,
          phone,
          documentId,
          address,
          city,
          region,
          postalCode,
        })
      );

      dispatch(setStep('SUMMARY'));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('No pudimos procesar los datos de tu tarjeta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Datos de Pago y Entrega">
      <form onSubmit={handleSubmit} className={styles.form}>
        {submitError && <div className={styles.errorBanner}>{submitError}</div>}

        {/* SECCIÓN 1: Datos de Tarjeta */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>1. Información de la Tarjeta</h4>

          <div className={styles.cardInputWrapper}>
            <Input
              label="Número de Tarjeta"
              value={cardNumber}
              onChange={handleCardNumberChange}
              onBlur={() => setCardNumberTouched(true)}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
              error={
                cardNumberTouched && rawCardNumber.length > 0 && !isCardNumberValid
                  ? 'Número de tarjeta inválido'
                  : undefined
              }
            />
            {brand !== 'UNKNOWN' && (
              <span
                className={`${styles.brandBadge} ${
                  brand === 'VISA' ? styles.visa : styles.mastercard
                }`}
              >
                {brand}
              </span>
            )}
          </div>

          <div className={styles.row}>
            <Input
              label="Mes Exp (MM)"
              value={expMonth}
              onChange={(val) => setExpMonth(val.replace(/\D/g, '').substring(0, 2))}
              placeholder="MM"
              maxLength={2}
              error={
                expMonth && expYear && !isExpiryValid
                  ? 'Fecha inválida'
                  : undefined
              }
            />
            <Input
              label="Año Exp (YY)"
              value={expYear}
              onChange={(val) => setExpYear(val.replace(/\D/g, '').substring(0, 2))}
              placeholder="YY"
              maxLength={2}
              error={
                expMonth && expYear && !isExpiryValid
                  ? 'Fecha inválida'
                  : undefined
              }
            />
            <Input
              label="CVC"
              value={cvc}
              onChange={(val) => setCvc(val.replace(/\D/g, '').substring(0, 4))}
              type="password"
              placeholder="123"
              maxLength={4}
              error={cvc && !isCvcValid ? 'CVC inválido' : undefined}
            />
          </div>

          <Input
            label="Nombre del Titular"
            value={cardHolder}
            onChange={setCardHolder}
            placeholder="Como aparece en la tarjeta"
          />
        </div>

        {/* SECCIÓN 2: Datos de Entrega */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>2. Información de Entrega</h4>

          <Input
            label="Nombre Completo"
            value={fullName}
            onChange={setFullName}
            placeholder="Juan Pérez"
          />

          <div className={styles.row}>
            <Input
              label="Correo Electrónico"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="juan@ejemplo.com"
              error={email && !isEmailValid ? 'Correo inválido' : undefined}
            />
            <Input
              label="Teléfono"
              value={phone}
              onChange={setPhone}
              type="tel"
              placeholder="3001234567"
              error={phone && !isPhoneValid ? 'Teléfono inválido' : undefined}
            />
          </div>

          <Input
            label="Documento de Identidad"
            value={documentId}
            onChange={setDocumentId}
            placeholder="C.C. o NIT"
          />

          <Input
            label="Dirección de Residencia"
            value={address}
            onChange={setAddress}
            placeholder="Calle 123 # 45 - 67"
          />

          <div className={styles.row}>
            <Input
              label="Ciudad"
              value={city}
              onChange={setCity}
              placeholder="Bogotá"
            />
            <Input
              label="Departamento / Región"
              value={region}
              onChange={setRegion}
              placeholder="Cundinamarca"
            />
          </div>

          <Input
            label="Código Postal (Opcional)"
            value={postalCode}
            onChange={setPostalCode}
            placeholder="110111"
          />
        </div>

        <div className={styles.actions}>
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
          >
            Continuar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
