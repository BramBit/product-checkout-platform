import { createHash } from 'crypto';

export function generateIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string,
): string {
  const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;
  return createHash('sha256').update(concatenatedString, 'utf8').digest('hex');
}
