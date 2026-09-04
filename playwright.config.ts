import { defineConfig, devices } from '@playwright/test';
const externalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  outputDir: 'tests/artifacts/2026-09-03-website-setup/playwright',
  use: {
    baseURL: 'http://127.0.0.1:4321/MyWebsite/',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  webServer: externalServer ? undefined : {
    command: 'node scripts/playwright-site.mjs',
    url: 'http://127.0.0.1:4321/MyWebsite/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGINT', timeout: 1_000 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], permissions: ['clipboard-read', 'clipboard-write'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
});
