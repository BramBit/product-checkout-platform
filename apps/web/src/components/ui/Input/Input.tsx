import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  maxLength,
}) => {
  const inputClasses = [
    styles.input,
    error ? styles.inputError : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <input
        type={type}
        className={inputClasses}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>!</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
