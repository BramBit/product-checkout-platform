import { describe, it, expect } from 'vitest';
import {
  luhnCheck,
  detectCardBrand,
  formatCardNumber,
  isValidExpiryDate,
  isValidCvc,
} from './cardValidation';

describe('cardValidation', () => {
  describe('luhnCheck', () => {
    it('returns true for valid card numbers', () => {
      expect(luhnCheck('4242424242424242')).toBe(true);
      expect(luhnCheck('4111111111111111')).toBe(true);
    });

    it('returns false for invalid card numbers', () => {
      expect(luhnCheck('1234567812345678')).toBe(false);
      expect(luhnCheck('')).toBe(false);
    });
  });

  describe('detectCardBrand', () => {
    it('detects VISA for numbers starting with 4', () => {
      expect(detectCardBrand('4242424242424242')).toBe('VISA');
      expect(detectCardBrand('4000 0000 0000 0000')).toBe('VISA');
    });

    it('detects MASTERCARD for numbers starting between 51-55', () => {
      expect(detectCardBrand('5100000000000000')).toBe('MASTERCARD');
      expect(detectCardBrand('5500000000000000')).toBe('MASTERCARD');
    });

    it('detects MASTERCARD for numbers in range 2221-2720', () => {
      expect(detectCardBrand('2221000000000000')).toBe('MASTERCARD');
      expect(detectCardBrand('2720000000000000')).toBe('MASTERCARD');
    });

    it('returns UNKNOWN for unrecognized brands', () => {
      expect(detectCardBrand('370000000000000')).toBe('UNKNOWN');
      expect(detectCardBrand('6011000000000000')).toBe('UNKNOWN');
      expect(detectCardBrand('')).toBe('UNKNOWN');
    });
  });

  describe('formatCardNumber', () => {
    it('formats raw digits into 4-digit groups separated by spaces', () => {
      expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
      expect(formatCardNumber('42424')).toBe('4242 4');
      expect(formatCardNumber('42424242')).toBe('4242 4242');
    });

    it('limits formatting to max 16 digits', () => {
      expect(formatCardNumber('42424242424242429999')).toBe('4242 4242 4242 4242');
    });
  });

  describe('isValidExpiryDate', () => {
    it('returns true for future dates', () => {
      expect(isValidExpiryDate('12', '30')).toBe(true);
      expect(isValidExpiryDate('01', '35')).toBe(true);
    });

    it('returns false for past dates', () => {
      expect(isValidExpiryDate('01', '20')).toBe(false);
      expect(isValidExpiryDate('12', '24')).toBe(false);
    });

    it('returns false for invalid months', () => {
      expect(isValidExpiryDate('13', '30')).toBe(false);
      expect(isValidExpiryDate('00', '30')).toBe(false);
      expect(isValidExpiryDate('invalid', '30')).toBe(false);
    });
  });

  describe('isValidCvc', () => {
    it('returns true for 3 and 4 digit numbers', () => {
      expect(isValidCvc('123')).toBe(true);
      expect(isValidCvc('1234')).toBe(true);
    });

    it('returns false for non-digit inputs or invalid lengths', () => {
      expect(isValidCvc('12')).toBe(false);
      expect(isValidCvc('12345')).toBe(false);
      expect(isValidCvc('abc')).toBe(false);
    });
  });
});
