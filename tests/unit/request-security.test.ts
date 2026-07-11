import { describe, expect, it } from 'vitest';
import { isSameOriginRequest, safeRelativePath } from '@/lib/request-security';

describe('redirect safety', () => {
  it.each(['/account', '/checkout?step=address', '/products/rose-magic#details'])(
    'allows a local path: %s',
    (path) => expect(safeRelativePath(path)).toBe(path)
  );

  it.each(['https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', null])(
    'rejects an unsafe redirect: %s',
    (path) => expect(safeRelativePath(path)).toBe('/account')
  );
});

describe('same-origin API requests', () => {
  it('accepts an exact origin', () => {
    const request = new Request('https://www.divinemee.com/api/test', {
      headers: { origin: 'https://www.divinemee.com' },
    });
    expect(isSameOriginRequest(request)).toBe(true);
  });

  it.each([undefined, 'https://evil.example', 'http://www.divinemee.com'])(
    'rejects a missing or different origin: %s',
    (origin) => {
      const headers = origin ? { origin } : undefined;
      expect(isSameOriginRequest(new Request('https://www.divinemee.com/api/test', { headers }))).toBe(false);
    }
  );
});
