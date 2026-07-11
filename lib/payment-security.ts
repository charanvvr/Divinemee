import { createHmac, timingSafeEqual } from 'node:crypto';

export function hmacHex(secret: string, value: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function verifyHmacHex(secret: string, value: string, signature: string) {
  if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = Buffer.from(hmacHex(secret, value), 'hex');
  const received = Buffer.from(signature, 'hex');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

export function verifyCheckoutSignature(
  secret: string,
  orderId: string,
  paymentId: string,
  signature: string
) {
  return verifyHmacHex(secret, `${orderId}|${paymentId}`, signature);
}

export function hashCheckoutIp(secret: string, forwardedFor: string | null) {
  const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown';
  return hmacHex(secret, ip);
}
