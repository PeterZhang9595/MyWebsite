import { expect, test } from '@playwright/test';

test('文章渲染代码、提示块和公式', async ({ page }) => {
  await page.goto('notes/cs285/policy-gradient/');
  await expect(page.locator('[data-callout="note"]')).toContainText('Fixture note callout');
  await expect(page.locator('pre code')).toContainText('const reward = 1');
  await expect(page.locator('.katex').first()).toBeVisible();
  await page.getByRole('button',{name:'Copy'}).click();
  await expect(page.getByRole('button',{name:'Copied'})).toBeVisible();
});
