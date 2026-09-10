import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

/**
 * Interests 卡牌化截图脚本。
 *
 * 输出到 tests/artifacts/2026-09-10-interests/：
 * - 主页 / 分类页 × 浅色 / 深色 × zh / en
 * - 浮层放大态 / 翻面态
 *
 * 需先 build（含 fixtures）并启动静态服务器于 4321。
 */
const base = 'http://127.0.0.1:4321/MyWebsite';
const outDir = 'tests/artifacts/2026-09-10-interests';

const shots = [
  { name: 'home-zh-light', url: '/interests/', theme: 'light', height: 1100 },
  { name: 'home-zh-dark', url: '/interests/', theme: 'dark', height: 1100 },
  { name: 'home-en-light', url: '/en/interests/', theme: 'light', height: 1100 },
  { name: 'category-zh-light', url: '/interests/sports/', theme: 'light', height: 1100 },
  { name: 'category-zh-dark', url: '/interests/sports/', theme: 'dark', height: 1100 },
  { name: 'category-en-light', url: '/en/interests/sports/', theme: 'light', height: 1100 },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: shot.height },
    deviceScaleFactor: 1,
    colorScheme: shot.theme,
  });
  const page = await context.newPage();
  await page.goto(`${base}${shot.url}`, { waitUntil: 'networkidle' });
  await page.evaluate((theme) => {
    document.documentElement.dataset.theme = theme;
  }, shot.theme);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${shot.name}.png`, fullPage: false });
  console.log('captured', shot.name);
  await context.close();
}

// 浮层状态图（主页双图）
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
});
const page = await context.newPage();
await page.goto(`${base}/interests/`, { waitUntil: 'networkidle' });
await page.locator('.flip-card--hero').first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/overlay-zoomed.png` });
console.log('captured overlay-zoomed');

await page.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
await page.waitForTimeout(800);
await page.screenshot({ path: `${outDir}/overlay-flipped.png` });
console.log('captured overlay-flipped');
await context.close();

await browser.close();
console.log('done');
