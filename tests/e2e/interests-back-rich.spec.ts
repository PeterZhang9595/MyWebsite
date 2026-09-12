import { expect, test } from '@playwright/test';

/**
 * 卡片背面富文本（设计 docs/design/2026-09-12-interests-back-rich-text.md）。
 *
 * 安全模型的三重约束里，E2E 能直接验证的是前两条的表现层结果：
 * - 富文本在**构建期**编译进 <template data-body-rich>（页面源里就能查）；
 * - 原始 HTML 已被构建期插件剥离（template 内容里不应出现 script 等）；
 * - 客户端只 cloneNode（代码评审层面保证，E2E 验证最终渲染结果即可）。
 */
test('富文本卡片在构建期编译进 template', async ({ page }) => {
  await page.goto('interests/medicine-life/');
  const card = page.locator('.flip-card', { hasText: 'Fixture 富文本医学卡' });
  await expect(card).toBeVisible();

  const rich = await card.evaluate((el) => {
    const template = el.querySelector('template[data-body-rich]');
    if (!template || !template.content) return null;
    return {
      img: template.content.querySelector('img[src$="social/default.png"]') !== null,
      katex: template.content.querySelector('.katex-display') !== null,
      list: template.content.querySelector('ul li') !== null,
      inlineCode: template.content.querySelector('code') !== null,
      dangerous: template.content.querySelector('script, iframe, object, embed, style') !== null,
    };
  });
  expect(rich, 'template[data-body-rich] 应存在且有内容').not.toBeNull();
  expect(rich!.img).toBe(true);
  expect(rich!.katex).toBe(true);
  expect(rich!.list).toBe(true);
  expect(rich!.inlineCode).toBe(true);
  expect(rich!.dangerous, '原始 HTML 必须在构建期被剥离').toBe(false);
});

test('翻面后背面渲染富文本且公式不撑宽浮层', async ({ page }) => {
  await page.goto('interests/medicine-life/');
  const card = page.locator('.flip-card', { hasText: 'Fixture 富文本医学卡' });
  await card.click(); // 打开放大
  const overlay = page.locator('.interests-overlay');
  await expect(overlay).toBeVisible();
  await overlay.click(); // 翻面

  const body = page.locator('[data-body]');
  await expect(body.locator('.katex-display')).toBeVisible();
  await expect(body.locator('img[src$="social/default.png"]')).toBeVisible();
  await expect(body.locator('ul li').first()).toBeVisible();

  // fixture 的背面公式刻意超出 68ch 窄栏：应横向滚动而非把浮层撑宽
  const overflow = await body.locator('.katex-display').evaluate((el) => ({
    overflowX: getComputedStyle(el).overflowX,
    scroll: el.scrollWidth,
    client: el.clientWidth,
  }));
  expect(overflow.overflowX).toBe('auto');
  expect(overflow.scroll).toBeGreaterThan(overflow.client);

  const docWidth = await page.locator('.interests-overlay__doc').evaluate((el) => el.getBoundingClientRect().width);
  // 68ch ≈ 612px（1rem 字号），留出余量；被撑宽会接近浮层全宽
  expect(docWidth).toBeLessThan(760);
});

test('纯文本卡片的背面仍然正常渲染', async ({ page }) => {
  await page.goto('interests/medicine-life/');
  const card = page.locator('.flip-card', { hasText: 'Fixture 医学卡' }).first();
  await card.click();
  const overlay = page.locator('.interests-overlay');
  await expect(overlay).toBeVisible();
  await overlay.click();

  const body = page.locator('[data-body]');
  await expect(body.locator('.interests-overlay__back-body').first()).toContainText('Fixture 医学正文。');
  await expect(body.locator('img')).toHaveCount(0);
});
