import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  const cardClasses = [styles.card, className].filter(Boolean).join(' ');
  return <div className={cardClasses}>{children}</div>;
};
