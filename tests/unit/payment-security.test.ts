import { describe, expect, it } from 'vitest';
import { hashCheckoutIp, hmacHex, verifyCheckoutSignature, verifyHmacHex } from '@/lib/payment-security';

describe('Razorpay signatures', () => {
  const secret = 'test-secret-never-used-in-production';

  it('accepts the expected checkout signature', () => {
    const signature = hmacHex(secret, 'order_123|pay_456');
    expect(verifyCheckoutSignature(secret, 'order_123', 'pay_456', signature)).toBe(true);
  });

  it('rejects tampered order IDs, payment IDs and malformed signatures', () => {
    const signature = hmacHex(secret, 'order_123|pay_456');
    expect(verifyCheckoutSignature(secret, 'order_other', 'pay_456', signature)).toBe(false);
    expect(verifyCheckoutSignature(secret, 'order_123', 'pay_other', signature)).toBe(false);
    expect(verifyCheckoutSignature(secret, 'order_123', 'pay_456', 'not-hex')).toBe(false);
  });

  it('validates raw webhook bodies exactly', () => {
    const raw = '{"event":"payment.captured"}';
    const signature = hmacHex(secret, raw);
    expect(verifyHmacHex(secret, raw, signature)).toBe(true);
    expect(verifyHmacHex(secret, `${raw} `, signature)).toBe(false);
  });

  it('hashes checkout IPs without retaining the address', () => {
    const hash = hashCheckoutIp(secret, '203.0.113.1, 10.0.0.1');
    expect(hash).toHaveLength(64);
    expect(hash).not.toContain('203.0.113.1');
  });
});
