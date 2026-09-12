import { expect, test } from '@playwright/test';

/**
 * 项目入口卡片：放大 + 副标题 + 封面 5:4（设计 docs/design/2026-09-10-projects-enhancement3.md）。
 *
 * 几何断言必须用 getBoundingClientRect 实测，不能靠 class 名推断 ——
 * `aspect-ratio` 是布局约束，只有真实盒尺寸能证明它生效。
 * 视口固定 1440：设计稿的实测值（3 列、卡片宽 348.8）都在这个宽度下取得。
 */
test.use({ viewport: { width: 1440, height: 900 } });

test('目录网格恰好三条轨道，每张卡片宽高比 5:4', async ({ page }) => {
  await page.goto('projects/');
  const grid = page.locator('.project-grid').first();
  const tracks = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  expect(tracks).toBe(3);

  const cards = page.locator('.project-card');
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const ratio = await cards.nth(index).evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width / rect.height;
    });
    // 5 / 4 = 1.25；±0.02 容差吸收边框与亚像素取整
    expect(ratio, `第 ${index} 张卡片`).toBeGreaterThan(1.23);
    expect(ratio, `第 ${index} 张卡片`).toBeLessThan(1.27);
  }
});

test('副标题截断为两行且不撑破卡片', async ({ page }) => {
  await page.goto('projects/');
  const card = page.locator('.project-card', { hasText: 'Fixture 富内容项目' });
  const subtitle = card.locator('.project-card__subtitle');
  await expect(subtitle).toBeVisible();

  const clamp = await subtitle.evaluate((el) => getComputedStyle(el).webkitLineClamp);
  expect(clamp).toBe('2');
  // fixture 的副标题远长于两行 —— scrollHeight > clientHeight 证明截断真的发生了
  const truncated = await subtitle.evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(truncated).toBe(true);

  // 信息条完整落在卡片盒内（不因副标题溢出卡片边界）
  const contained = await card.evaluate((el) => {
    const cardRect = el.getBoundingClientRect();
    const meta = el.querySelector('.project-card__meta')?.getBoundingClientRect();
    if (!meta) return false;
    return meta.bottom <= cardRect.bottom + 0.5 && meta.left >= cardRect.left - 0.5 && meta.right <= cardRect.right + 0.5;
  });
  expect(contained).toBe(true);
});

test('有封面卡的可见封面高显著高于 3:2 时代', async ({ page }) => {
  await page.goto('projects/');
  const card = page.locator('.project-card', { hasText: 'Fixture 富内容项目' });
  // 封面绝对定位铺满整卡，可见部分 = 卡高 − 信息条高。
  // 3:2 时代实测可见封面 145.2–164.2px；5:4 后按设计实测应 ≥ 191.7px（卡宽 348.8 时）。
  const visibleCover = await card.evaluate((el) => {
    const cardRect = el.getBoundingClientRect();
    const meta = el.querySelector('.project-card__meta')?.getBoundingClientRect();
    if (!meta) return 0;
    return cardRect.height - meta.height;
  });
  expect(visibleCover).toBeGreaterThan(170);
});

test('信息条容器承载标题与副标题（结构断言）', async ({ page }) => {
  await page.goto('projects/');
  const card = page.locator('.project-card', { hasText: 'Fixture 富内容项目' });
  const meta = card.locator('.project-card__meta');
  await expect(meta).toBeVisible();
  await expect(meta.locator('.project-card__title')).toHaveText('Fixture 富内容项目');
  await expect(meta.locator('.project-card__subtitle')).toContainText('副标题');
});
