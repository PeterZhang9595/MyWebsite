import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const externalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1';

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: resolve(tmpdir(), 'mywebsite-e2e-report'), open: 'never' }],
  ],
  // 失败产物放系统临时目录：本机安全策略把 rm 重定向到 trash，
  // 而 trash 拒绝处理工作区内的路径，会让 Playwright 清理旧产物时直接报错。
  outputDir: resolve(tmpdir(), 'mywebsite-e2e-artifacts'),
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
