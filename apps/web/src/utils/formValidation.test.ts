import { describe, it, expect } from 'vitest';
import { isValidEmail, isNotEmpty, isValidPhone } from './formValidation';

describe('formValidation', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co')).toBe(true);
    });

    it('returns false for invalid email addresses', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@domain')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('  a  ')).toBe(true);
    });

    it('returns false for empty or whitespace-only strings', () => {
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty('   ')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for valid phone numbers with 7-15 digits', () => {
      expect(isValidPhone('3001234567')).toBe(true);
      expect(isValidPhone('+57 300 123 4567')).toBe(true);
      expect(isValidPhone('1234567')).toBe(true);
    });

    it('returns false for phone numbers with invalid digit counts', () => {
      expect(isValidPhone('123456')).toBe(false);
      expect(isValidPhone('1234567890123456')).toBe(false);
    });
  });
});
