export const isValidEmail = (email: string): boolean => {
  const cleanEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleanEmail);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isValidPhone = (phone: string): boolean => {
  const cleanDigits = phone.replace(/\D/g, '');
  return cleanDigits.length >= 7 && cleanDigits.length <= 15;
};
