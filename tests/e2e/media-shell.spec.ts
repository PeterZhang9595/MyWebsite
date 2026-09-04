import { expect, test } from '@playwright/test';

test('句子在标签页中保持且播放器空状态禁用', async ({ page }) => {
  await page.goto('./');
  const first = await page.locator('.quote blockquote').textContent();
  await page.getByRole('button',{name:'换一个'}).click();
  const second = await page.locator('.quote blockquote').textContent();
  expect(second).not.toBe(first);
  await page.reload();
  await expect(page.locator('.quote blockquote')).toHaveText(second!);
  await expect(page.getByRole('button',{name:'Play'})).toBeDisabled();
  await expect(page.locator('video source')).toHaveCount(0);
});
