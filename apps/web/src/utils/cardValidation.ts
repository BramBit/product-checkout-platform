export const luhnCheck = (cardNumber: string): boolean => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (!cleanNumber || cleanNumber.length === 0) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const detectCardBrand = (cardNumber: string): 'VISA' | 'MASTERCARD' | 'UNKNOWN' => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (!cleanNumber) return 'UNKNOWN';

  if (cleanNumber.startsWith('4')) {
    return 'VISA';
  }

  const firstTwo = parseInt(cleanNumber.substring(0, 2), 10);
  if (firstTwo >= 51 && firstTwo <= 55) {
    return 'MASTERCARD';
  }

  const firstFour = parseInt(cleanNumber.substring(0, 4), 10);
  if (firstFour >= 2221 && firstFour <= 2720) {
    return 'MASTERCARD';
  }

  return 'UNKNOWN';
};

export const formatCardNumber = (value: string): string => {
  const cleanNumber = value.replace(/\D/g, '').substring(0, 16);
  const groups = cleanNumber.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleanNumber;
};

export const isValidExpiryDate = (month: string, year: string): boolean => {
  const cleanMonth = month.trim();
  const cleanYear = year.trim();

  const monthNum = parseInt(cleanMonth, 10);
  const yearNum = parseInt(cleanYear, 10);

  if (isNaN(monthNum) || isNaN(yearNum)) return false;
  if (monthNum < 1 || monthNum > 12) return false;

  // Expected format for year is 2 digits (YY) or 4 digits (YYYY)
  const fullYear = cleanYear.length === 2 ? 2000 + yearNum : yearNum;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-based month

  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && monthNum < currentMonth) return false;

  return true;
};

export const isValidCvc = (cvc: string): boolean => {
  const cleanCvc = cvc.trim();
  return /^\d{3,4}$/.test(cleanCvc);
};
