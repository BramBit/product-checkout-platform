import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  maxLength,
}) => {
  const inputClasses = [
    styles.input,
    error ? styles.inputError : '',
  ].filter(Boolean).join(' ');

  const inputId = `input-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className={styles.container}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className={inputClasses}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
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
