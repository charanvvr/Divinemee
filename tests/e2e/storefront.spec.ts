import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

test('homepage, catalog and responsive layout render without console errors', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pour.');
  expect(await page.locator('a[href="/products/rose-magic"]').count()).toBeGreaterThan(0);
  expect(await page.locator('a[href="/products/lavender-bliss"]').count()).toBeGreaterThan(0);
  await expect(page.getByText('328 verified reviews')).toHaveCount(0);
  expect(await page.locator('html').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);

  const screenshotDir = path.join(process.cwd(), 'audit/evidence/screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });
  await page.screenshot({
    path: path.join(screenshotDir, `homepage-${testInfo.project.name}.png`),
    fullPage: false,
  });
  expect(errors).toEqual([]);
});

test('guest cart supports add, quantity, remove and checkout navigation', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const hero = page.locator('section#top');
  const addButton = hero.getByRole('button').filter({ hasText: 'ADD TO BAG' });
  await expect(addButton).toHaveCount(1);
  await addButton.click();

  const cart = page.getByRole('dialog', { name: 'Shopping cart' });
  await expect(cart).toBeVisible();
  await expect(cart.getByText('Lavender Bath Salt', { exact: true })).toBeVisible();
  await cart.getByRole('button', { name: 'Increase' }).click();
  await expect(cart.getByText('2', { exact: true })).toBeVisible();
  await cart.getByRole('button', { name: 'Decrease' }).click();
  await expect(cart.getByText('1', { exact: true })).toBeVisible();
  await cart.getByRole('link', { name: 'CHECKOUT' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  expect(await page.locator('html').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(false);
  await expect(page.getByLabel('State or union territory')).toBeVisible();

  const phone = page.getByLabel('Phone');
  await phone.fill('+37126654986');
  expect(await phone.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(false);
  await phone.fill('+91 9876543210');
  expect(await phone.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(true);

  const pin = page.getByLabel('PIN code');
  await pin.fill('012345');
  expect(await pin.evaluate((element: HTMLInputElement) => element.checkValidity())).toBe(false);
});

test('authentication forms are labelled and protected routes redirect safely', async ({ page }) => {
  await page.goto('/login?redirect=https://evil.example', { waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await page.goto('/register', { waitUntil: 'domcontentloaded' });
  await expect(page.getByLabel('Full name')).toBeVisible();
  await expect(page.getByLabel('Confirm password')).toBeVisible();
  await page.goto('/account', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount|\/login\?redirect=\/account/);
});

test('product metadata, robots, sitemap and invalid routes are correct', async ({ page, request }) => {
  await page.goto('/products/rose-magic', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Rose Bath Salt' })).toBeVisible();
  const productJson = await page.locator('script[type="application/ld+json"]').textContent();
  expect(productJson).toBeTruthy();
  expect(JSON.parse(productJson || '{}')).toMatchObject({
    '@type': 'Product',
    name: 'Rose Bath Salt',
    offers: { price: 349, priceCurrency: 'INR' },
  });

  expect((await request.get('/robots.txt')).status()).toBe(200);
  expect((await request.get('/sitemap.xml')).status()).toBe(200);
  expect((await request.get('/not-a-real-route-codex')).status()).toBe(404);
  expect((await request.get('/order/success?token=fabricated')).status()).toBe(404);
});

test('payment APIs reject cross-origin and unverified requests', async ({ request }) => {
  const hostile = await request.post('/api/razorpay/create-order', {
    headers: { origin: 'https://evil.example' },
    data: {},
  });
  expect(hostile.status()).toBe(403);

  const root = await request.get('/');
  const sameOrigin = await request.post('/api/razorpay/create-order', {
    headers: { origin: new URL(root.url()).origin },
    data: {},
  });
  expect(sameOrigin.status()).toBe(400);

  const foreignAddress = await request.post('/api/razorpay/create-order', {
    headers: { origin: new URL(root.url()).origin },
    data: {
      items: [{ id: 'rose-magic', qty: 1 }],
      idempotencyKey: '7496e8ad-0510-493b-a041-9b64c44c7dd7',
      customer: {
        fullName: 'Audit Customer',
        phone: '+37126654986',
        email: 'audit@example.com',
        address: '183 Test Street',
        city: 'Riga',
        state: 'Riga',
        pinCode: '507002',
        country: 'LV',
      },
    },
  });
  expect(foreignAddress.status()).toBe(400);

  const indianAddress = await request.post('/api/razorpay/create-order', {
    headers: { origin: new URL(root.url()).origin },
    data: {
      items: [{ id: 'rose-magic', qty: 1 }],
      idempotencyKey: '7838b095-daa7-47e7-8e99-20aaf6ef8064',
      customer: {
        fullName: 'Audit Customer',
        phone: '+919876543210',
        email: 'audit@example.com',
        address: '183 Test Street',
        city: 'Hyderabad',
        state: 'Telangana',
        pinCode: '500001',
        country: 'IN',
      },
    },
  });
  expect(indianAddress.status()).toBe(503);

  const unverified = await request.post('/api/razorpay/verify-payment', {
    headers: { origin: new URL(root.url()).origin },
    data: {},
  });
  expect(unverified.status()).toBe(400);

  const webhook = await request.post('/api/razorpay/webhook', { data: {} });
  expect([400, 503]).toContain(webhook.status());
});

test('reduced-motion homepage remains usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pour.');
  await expect(page.locator('section#top')).toBeVisible();
});
