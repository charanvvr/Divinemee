import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('homepage and checkout have no automated accessibility violations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1_200);
  const homepage = await new AxeBuilder({ page }).analyze();
  expect(homepage.violations).toEqual([]);

  await page.goto('/checkout', { waitUntil: 'domcontentloaded' });
  const checkout = await new AxeBuilder({ page }).analyze();
  expect(checkout.violations).toEqual([]);
});
