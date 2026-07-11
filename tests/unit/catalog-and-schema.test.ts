import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { PRODUCT_LIST } from '@/lib/products';

describe('production catalog', () => {
  it('contains exactly the two ₹279 Epsom salt products', () => {
    expect(PRODUCT_LIST).toHaveLength(2);
    expect(PRODUCT_LIST.map(({ id, name, price, weight }) => ({ id, name, price, weight }))).toEqual([
      { id: 'rose-magic', name: 'Rose Epsom Salt', price: 279, weight: '400 g' },
      { id: 'lavender-bliss', name: 'Lavender Epsom Salt', price: 279, weight: '400 g' },
    ]);
  });

  it('uses existing primary and gallery assets', () => {
    for (const product of PRODUCT_LIST) {
      for (const source of [product.cutout, ...product.gallery.map((image) => image.src)]) {
        expect(fs.existsSync(path.join(process.cwd(), 'public', source))).toBe(true);
      }
    }
  });
});

describe('database hardening migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/004_payment_reconciliation.sql'),
    'utf8'
  );

  it.each([
    'checkout_sessions',
    'payment_webhook_events',
    'finalize_razorpay_checkout',
    'claim_checkout_order_creation',
    'orders_checkout_session_idx',
    'addresses_one_default_per_user_idx',
    'ENABLE ROW LEVEL SECURITY',
    'WITH CHECK (auth.uid() = user_id)',
  ])('contains %s', (control) => expect(sql).toContain(control));
});

describe('customer input constraints migration', () => {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/005_customer_input_constraints.sql'),
    'utf8'
  );

  it.each([
    'profiles_phone_format',
    'addresses_phone_format',
    'addresses_indian_state',
    'addresses_indian_pin',
    'addresses_country_india',
  ])('contains %s', (control) => expect(sql).toContain(control));
});
