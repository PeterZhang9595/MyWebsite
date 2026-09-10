import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

/**
 * Interests 增强二期截图脚本。
 *
 * 输出到 tests/artifacts/2026-09-10-interests2/：
 * - 主页 / 分类页 × 浅色 / 深色 × zh / en
 * - 主页悬浮某张类别卡（验证后续卡让位、标题完整露出）
 * - 浮层放大态 / 翻面态
 *
 * 需先 build（含 fixtures）并启动静态服务器于 4321。
 */
const base = 'http://127.0.0.1:4321/MyWebsite';
const outDir = 'tests/artifacts/2026-09-10-interests3';

const shots = [
  { name: 'home-zh-light', url: '/interests/', theme: 'light' },
  { name: 'home-zh-dark', url: '/interests/', theme: 'dark' },
  { name: 'home-en-light', url: '/en/interests/', theme: 'light' },
  { name: 'category-zh-light', url: '/interests/sports/', theme: 'light' },
  { name: 'category-zh-dark', url: '/interests/sports/', theme: 'dark' },
  { name: 'category-en-light', url: '/en/interests/sports/', theme: 'light' },
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
    colorScheme: shot.theme,
  });
  const page = await context.newPage();
  await page.goto(`${base}${shot.url}`, { waitUntil: 'networkidle' });
  await page.evaluate((theme) => {
    document.documentElement.dataset.theme = theme;
  }, shot.theme);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${shot.name}.png` });
  console.log('captured', shot.name);
  await context.close();
}

// 主页悬浮态：验证被遮盖的卡片让位后标题完整可读。
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(`${base}/interests/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  // 悬停第二张类别卡：它左侧被引导卡压着，右侧压着下一张。
  await page.locator('.rail-card').nth(1).hover();
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${outDir}/home-hover-card.png` });
  console.log('captured home-hover-card');
  await context.close();
}

// 分类页整页滚动前后：验证渐变层固定在视口。
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(`${base}/interests/sports/`, { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/category-scrolled-bottom.png` });
  console.log('captured category-scrolled-bottom');
  await context.close();
}

// 浮层状态图
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  const page = await context.newPage();
  await page.goto(`${base}/interests/sports/`, { waitUntil: 'networkidle' });
  await page.locator('.interests-wall .flip-card').first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${outDir}/overlay-zoomed.png` });
  console.log('captured overlay-zoomed');

  await page.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/overlay-flipped.png` });
  console.log('captured overlay-flipped');
  await context.close();
}

await browser.close();
console.log('done');
