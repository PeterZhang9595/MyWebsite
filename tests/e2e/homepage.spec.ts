import { expect, test } from '@playwright/test';

test('中文主页展示资料、Bio、列表和媒体外壳', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('lang','zh-CN');
  await expect(page.getByRole('heading',{name:'Peter Zhang'})).toBeVisible();
  await expect(page.getByText('China / Beijing')).toBeVisible();
  await expect(page.getByRole('link',{name:/GitHub/})).toBeVisible();
  await page.getByRole('button',{name:'完整'}).click();
  await expect(page.getByText('Fixture 中文完整简介第二段。')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Fixture 中文默认简介。')).toBeVisible();
  await expect(page.getByText('播放列表待添加')).toBeVisible();
});

test('主题选择刷新后保持', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button',{name:'切换主题'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
