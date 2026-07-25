import React from 'react';
import styles from './Button.module.css';
import { Spinner } from '../Spinner/Spinner';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  children,
}) => {
  const isButtonDisabled = disabled || isLoading;
  const buttonClasses = [styles.button, styles[variant]].join(' ');
  const spinnerVariant = variant === 'secondary' ? 'dark' : 'light';

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isButtonDisabled}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" variant={spinnerVariant} />
          <span>Cargando...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
