import { z } from 'zod';
import { PRODUCTS, type ProductId } from '@/lib/products';
import { INDIAN_STATES, isIndianMobile, isIndianPin, normalizeIndianMobile } from '@/lib/india-address';

export const cartItemsSchema = z
  .array(
    z.object({
      id: z.enum(['rose-magic', 'lavender-bliss', 'test-1rupee']),
      qty: z.number().int().min(1).max(20),
    })
  )
  .min(1)
  .max(20);

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().refine(isIndianMobile, 'Enter a valid Indian mobile number.').transform(normalizeIndianMobile),
  email: z.string().trim().email().max(254),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  state: z.enum(INDIAN_STATES),
  pinCode: z.string().trim().refine(isIndianPin, 'Enter a valid Indian PIN code.'),
  country: z.literal('IN'),
});

export function calculateOrder(items: z.infer<typeof cartItemsSchema>) {
  const normalized = items.map((item) => {
    const product = PRODUCTS[item.id as ProductId];
    return {
      productId: product.id,
      productName: product.name,
      quantity: item.qty,
      price: product.price,
      total: product.price * item.qty,
    };
  });
  const subtotal = normalized.reduce((sum, item) => sum + item.total, 0);
  // Hidden test items (the ₹1 payment-test product) ship free so the charge is exactly ₹1.
  const allHidden = items.every((item) => PRODUCTS[item.id as ProductId].hidden);
  const shipping = subtotal >= 399 || allHidden ? 0 : 49;
  return { items: normalized, subtotal, shipping, total: subtotal + shipping };
}

export function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DM-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
