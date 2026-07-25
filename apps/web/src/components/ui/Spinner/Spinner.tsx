import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', variant = 'light' }) => {
  const spinnerClasses = [
    styles.spinner,
    styles[size],
    variant === 'dark' ? styles.dark : '',
  ].filter(Boolean).join(' ');

  return <span className={spinnerClasses} role="status" aria-label="Cargando..." />;
};
