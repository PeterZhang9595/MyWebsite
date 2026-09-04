import { expect, test } from '@playwright/test';

test('移动端使用单栏且路径不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./');
  const main = page.locator('.home-main');
  const aside = page.locator('.home-aside');
  expect((await aside.boundingBox())!.y).toBeGreaterThan((await main.boundingBox())!.y);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
