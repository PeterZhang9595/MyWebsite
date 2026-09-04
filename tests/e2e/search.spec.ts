import { expect, test } from '@playwright/test';

test('中文搜索只返回中文 fixture 内容', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button',{name:'搜索'}).click();
  const input = page.getByRole('searchbox');
  await input.fill('策略梯度');
  await expect(page.getByRole('link',{name:/Fixture 策略梯度/})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'搜索'})).toBeFocused();
});
