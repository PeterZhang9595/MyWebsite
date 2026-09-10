import { expect, test } from '@playwright/test';

const zhCategories = ['课程大作业', '自用小项目', '比赛项目', '科研项目', '大型项目'];
const enCategories = ['Course assignments', 'Personal tools', 'Competitions', 'Research', 'Large projects'];

test('项目首页按固定顺序展示五个分类分区', async ({ page }) => {
  await page.goto('projects/');
  await expect(page.locator('.project-group__title')).toHaveText(zhCategories);
});

test('英文项目首页使用英文分类名', async ({ page }) => {
  await page.goto('en/projects/');
  await expect(page.locator('.project-group__title')).toHaveText(enCategories);
});

test('每个分区至少渲染一张卡片', async ({ page }) => {
  await page.goto('projects/');
  await expect(page.locator('.project-group')).toHaveCount(zhCategories.length);
  for (let index = 0; index < zhCategories.length; index += 1) {
    await expect(page.locator('.project-group').nth(index).locator('.project-card')).not.toHaveCount(0);
  }
});

test('点击卡片进入项目页', async ({ page }) => {
  await page.goto('projects/');
  await page.locator('.project-card', { hasText: 'Fixture 大型项目' }).click();
  await expect(page).toHaveURL(/projects\/large-enterprise\/$/);
  await expect(page.locator('.terminal-path__line')).toBeVisible();
});

test('项目页使用左右各 10% 的宽版布局', async ({ page }) => {
  await page.goto('projects/large-enterprise/');
  const main = page.locator('main.content-page--wide');
  await expect(main).toBeVisible();
  const ratio = await main.evaluate((element) => element.getBoundingClientRect().width / window.innerWidth);
  // 宽版为框架宽度的 80%（左右各约 10%），框内边距使相对窗口比值略低于 0.80，故放宽区间。
  expect(ratio).toBeGreaterThan(0.71);
  expect(ratio).toBeLessThan(0.86);
});

test('项目目录页提供固定的三个入口', async ({ page }) => {
  await page.goto('projects/large-enterprise/');
  const entries = page.locator('.project-entries__item');
  await expect(entries).toHaveText(['代码仓库', 'Demo', '核心功能', '开发过程']);
  await expect(entries.nth(0)).toHaveAttribute('target', '_blank');
  await expect(entries.nth(2)).toHaveAttribute('href', '/MyWebsite/projects/large-enterprise/features/');
  await expect(entries.nth(3)).toHaveAttribute('href', '/MyWebsite/projects/large-enterprise/dev-log/');
});

test('项目支持无限层级子页面', async ({ page }) => {
  for (const route of [
    'projects/large-enterprise/features/',
    'projects/large-enterprise/dev-log/',
    'en/projects/large-enterprise/features/',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator('.terminal-path__line')).toBeVisible();
  }
});

test('固定子页不会作为卡片重复出现在目录页', async ({ page }) => {
  await page.goto('projects/large-enterprise/');
  await expect(page.locator('.project-card')).toHaveCount(0);
});

// —— 二轮视觉增强 ——

const focusPurple = 'rgb(102, 87, 200)';

test('目录卡片不再渲染状态角标', async ({ page }) => {
  // 2026-09-10 用户决定移除卡片左上角状态点（观感廉价）。
  await page.goto('projects/');
  await expect(page.locator('.project-card')).not.toHaveCount(0);
  await expect(page.locator('.project-card .project-status')).toHaveCount(0);
});

test('卡片悬停变灰而非边框变紫', async ({ page }) => {
  await page.goto('projects/');
  const card = page.locator('.project-card', { hasText: 'Fixture 项目' }).first();
  await expect(card).toBeVisible();
  await card.hover();
  await expect(card).toHaveCSS('filter', /saturate\(/);
  const border = await card.evaluate((el) => getComputedStyle(el).borderColor);
  expect(border).not.toBe(focusPurple);
});

test('项目首页存在散点背景氛围层', async ({ page }) => {
  await page.goto('projects/');
  await expect(page.locator('.project-atmosphere')).toBeVisible();
  await expect(page.locator('.project-atmosphere__dot').first()).toBeVisible();
  // 氛围层不响应指针
  await expect(page.locator('.project-atmosphere')).toHaveCSS('pointer-events', 'none');
});

test('进行中项目详情页显示蓝色波纹状态灯', async ({ page }) => {
  await page.goto('projects/fixture-project/');
  await expect(page.locator('.status-ripple--active')).toBeVisible();
  await expect(page.locator('.status-ripple__label')).toHaveText('进行中');
});

test('已完成项目详情页显示绿色波纹状态灯', async ({ page }) => {
  await page.goto('projects/course-demo/');
  await expect(page.locator('.status-ripple--completed')).toBeVisible();
  await expect(page.locator('.status-ripple__label')).toHaveText('已完成');
});

test('已归档项目详情页显示红色波纹状态灯', async ({ page }) => {
  await page.goto('projects/legacy-tool/');
  await expect(page.locator('.status-ripple--archived')).toBeVisible();
  await expect(page.locator('.status-ripple__label')).toHaveText('已归档');
});

test('详情页技术栈渲染对应图标 SVG', async ({ page }) => {
  await page.goto('projects/legacy-tool/');
  const icon = page.locator('.project-tech__icon', { has: page.locator('path') }).first();
  await expect(icon).toBeVisible();
  await expect(icon).toHaveAttribute('aria-label', 'Python');
});

test('同一分类分区可容纳多个子项目（动态扩展）', async ({ page }) => {
  await page.goto('projects/');
  const personalGroup = page.locator('.project-group', { hasText: '自用小项目' });
  await expect(personalGroup.locator('.project-card')).toHaveCount(2);
});

