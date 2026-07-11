import { describe, expect, it } from 'vitest';
import { addressSchema, calculateOrder, cartItemsSchema } from '@/lib/commerce';

describe('trusted order calculation', () => {
  it('uses the server catalog price and converts two products to free shipping', () => {
    const result = calculateOrder([
      { id: 'rose-magic', qty: 1 },
      { id: 'lavender-bliss', qty: 1 },
    ]);
    expect(result).toMatchObject({ subtotal: 558, shipping: 0, total: 558 });
    expect(result.items.map((item) => item.price)).toEqual([279, 279]);
  });

  it('charges ₹49 shipping below ₹399', () => {
    expect(calculateOrder([{ id: 'rose-magic', qty: 1 }]).total).toBe(328);
  });

  it.each([
    [{ id: 'fake-product', qty: 1 }],
    [{ id: 'rose-magic', qty: 0 }],
    [{ id: 'rose-magic', qty: -1 }],
    [{ id: 'rose-magic', qty: 1.5 }],
    [{ id: 'rose-magic', qty: 21 }],
    [{ id: 'rose-magic', qty: '2' }],
  ])('rejects an invalid cart: %j', (items) => {
    expect(cartItemsSchema.safeParse(items).success).toBe(false);
  });

  it('ignores a client-supplied price field', () => {
    const parsed = cartItemsSchema.parse([{ id: 'rose-magic', qty: 1, price: 1 }]);
    expect(calculateOrder(parsed).total).toBe(328);
  });
});

describe('checkout address validation', () => {
  const valid = {
    fullName: 'CODEX TEST CUSTOMER',
    phone: '9876543210',
    email: 'codex_test@example.com',
    address: '12 Test Street',
    city: 'Hyderabad',
    state: 'Telangana',
    pinCode: '500001',
    country: 'IN' as const,
  };

  it('accepts a valid Indian checkout address', () => {
    expect(addressSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    { pinCode: '12345' },
    { pinCode: 'abcdef' },
    { email: 'not-an-email' },
    { phone: '123' },
    { phone: '+37126654986' },
    { state: 'Riga' },
    { country: 'LV' },
    { pinCode: '012345' },
    { fullName: ' ' },
    { address: '<script>alert(1)</script>'.repeat(20) },
  ])('rejects invalid address input: %j', (change) => {
    expect(addressSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });

  it('normalizes an Indian mobile number before it is stored', () => {
    expect(addressSchema.parse({ ...valid, phone: '9876543210' }).phone).toBe('+919876543210');
  });
});
