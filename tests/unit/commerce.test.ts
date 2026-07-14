import { describe, expect, it } from 'vitest';
import { addressSchema, calculateOrder, cartItemsSchema } from '@/lib/commerce';

describe('trusted order calculation', () => {
  it('uses the server catalog price and gives free shipping over ₹399', () => {
    const result = calculateOrder([
      { id: 'rose-magic', qty: 1 },
      { id: 'lavender-bliss', qty: 1 },
    ]);
    expect(result).toMatchObject({ subtotal: 698, shipping: 0, total: 698 });
    expect(result.items.map((item) => item.price)).toEqual([349, 349]);
  });

  it('prices the Epsom salt at ₹279', () => {
    expect(calculateOrder([{ id: 'epsom-salt', qty: 1 }]).subtotal).toBe(279);
  });

  it('charges ₹49 shipping below ₹399', () => {
    expect(calculateOrder([{ id: 'rose-magic', qty: 1 }]).total).toBe(398);
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
    expect(calculateOrder(parsed).total).toBe(398);
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
    { pinCode: '1234567' },
    { email: 'not-an-email' },
    { phone: '123' },
    { phone: '12345678901234' },
    { phone: '+37126654986' },
    { phone: '5123456789' },
    { state: 'Riga' },
    { country: 'LV' },
    { pinCode: '012345' },
    { fullName: ' ' },
    { fullName: 'A' },
    { address: '<script>alert(1)</script>'.repeat(20) },
    { state: ['Telangana'] as unknown as string },
    { city: { toString: () => 'Hyderabad' } as unknown as string },
    { phone: ['9876543210'] as unknown as string },
    { pinCode: 500001 as unknown as string },
  ])('rejects invalid address input: %j', (change) => {
    expect(addressSchema.safeParse({ ...valid, ...change }).success).toBe(false);
  });

  it.each([
    ['9876543210', '+919876543210'],
    ['+91 9876543210', '+919876543210'],
    ['+919876543210', '+919876543210'],
    ['919876543210', '+919876543210'],
    ['98765-43210', '+919876543210'],
  ])('accepts and normalizes a valid Indian mobile %s -> %s', (input, expected) => {
    const parsed = addressSchema.safeParse({ ...valid, phone: input });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.phone).toBe(expected);
  });
});
