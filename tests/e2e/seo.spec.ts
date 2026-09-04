import { expect, test } from '@playwright/test';

test('页面具有 canonical、Open Graph 和 JSON-LD', async ({ page }) => {
  await page.goto('notes/cs285/policy-gradient/');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',/MyWebsite\/notes\/cs285\/policy-gradient/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content','Fixture 策略梯度');
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('Article');
  expect(jsonLd).toContain('datePublished');
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(2);
});
