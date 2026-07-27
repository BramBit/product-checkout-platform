import axios from 'axios';

export interface TokenizeCardDTO {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

export const tokenizeCard = async (cardData: TokenizeCardDTO): Promise<string> => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_PAYMENT_GATEWAY_SANDBOX_URL}/tokens/cards`,
      {
        number: cardData.number.replace(/\s/g, ''),
        exp_month: cardData.expMonth,
        exp_year: cardData.expYear,
        cvc: cardData.cvc,
        card_holder: cardData.cardHolder,
      },
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PAYMENT_GATEWAY_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.data.id;
  } catch {
    throw new Error('No pudimos validar tu tarjeta, verifica los datos e intenta de nuevo.');
  }
};
