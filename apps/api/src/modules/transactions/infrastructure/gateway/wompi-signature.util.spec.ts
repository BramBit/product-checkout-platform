import { generateIntegritySignature } from './wompi-signature.util';
import { createHash } from 'crypto';

describe('generateIntegritySignature', () => {
  it('should produce a deterministic SHA-256 hash (same input produces same output)', () => {
    const reference = 'ref-12345';
    const amountInCents = 500000;
    const currency = 'COP';
    const integritySecret = 'prod_integrity_secret_123';

    const hash1 = generateIntegritySignature(reference, amountInCents, currency, integritySecret);
    const hash2 = generateIntegritySignature(reference, amountInCents, currency, integritySecret);

    expect(hash1).toBe(hash2);
  });

  it('should produce different hashes for different inputs', () => {
    const hash1 = generateIntegritySignature('ref-1', 500000, 'COP', 'secret');
    const hash2 = generateIntegritySignature('ref-2', 500000, 'COP', 'secret');
    const hash3 = generateIntegritySignature('ref-1', 600000, 'COP', 'secret');

    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash2).not.toBe(hash3);
  });

  it('should concatenate parameters in the exact order (reference + amountInCents + currency + integritySecret)', () => {
    const reference = 'TEST_REF_001';
    const amountInCents = 1500000;
    const currency = 'COP';
    const integritySecret = 'test_secret_abc';

    const concatenatedString = `${reference}${amountInCents}${currency}${integritySecret}`;
    const expectedHash = createHash('sha256').update(concatenatedString, 'utf8').digest('hex');

    const result = generateIntegritySignature(reference, amountInCents, currency, integritySecret);

    expect(result).toBe(expectedHash);
  });
});
