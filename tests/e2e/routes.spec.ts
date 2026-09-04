import { expect, test } from '@playwright/test';

for (const route of ['notes/','notes/cs285/','notes/cs285/policy-gradient/','en/notes/','en/notes/cs285/policy-gradient/','tips/fixture-tip/','projects/fixture-project/','interests/']) {
  test(`route ${route}`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.terminal-path__line')).toBeVisible();
  });
}

test('未翻译文章切换到英文 Notes 首页', async ({ page }) => {
  await page.goto('notes/untranslated-note/');
  await expect(page.getByRole('link',{name:'切换语言'})).toHaveAttribute('href','/MyWebsite/en/notes/');
});

test('未知路径返回双语 404', async ({ page }) => {
  const response = await page.goto('missing-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('link',{name:'中文首页'})).toBeVisible();
  await expect(page.getByRole('link',{name:'English home'})).toBeVisible();
});
