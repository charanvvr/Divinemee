import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:3000';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'audit/evidence/playwright',
  fullyParallel: false,
  timeout: 60_000,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'audit/evidence/playwright-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox-desktop', testIgnore: /accessibility\.spec\.ts/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit-desktop', testIgnore: /accessibility\.spec\.ts/, use: { ...devices['Desktop Safari'] } },
    { name: 'tablet', testIgnore: /accessibility\.spec\.ts/, use: { viewport: { width: 768, height: 1024 } } },
    { name: 'mobile-small', testIgnore: /accessibility\.spec\.ts/, use: { viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true } },
    { name: 'mobile-standard', testIgnore: /accessibility\.spec\.ts/, use: { ...devices['iPhone 13'] } },
  ],
});
