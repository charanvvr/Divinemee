import { z } from 'zod';
import { PRODUCTS, type ProductId } from '@/lib/products';

export const cartItemsSchema = z
  .array(
    z.object({
      id: z.enum(['rose-magic', 'lavender-bliss']),
      qty: z.number().int().min(1).max(20),
    })
  )
  .min(1)
  .max(20);

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+ -]{10,15}$/),
  email: z.string().trim().email(),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode: z.string().trim().regex(/^[0-9]{6}$/),
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
  const shipping = subtotal >= 399 ? 0 : 49;
  return { items: normalized, subtotal, shipping, total: subtotal + shipping };
}

export function makeOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  return `DM-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}
