import { expect, test } from '@playwright/test';

/**
 * 正文代码块深色化 + 公式横向滚动（设计 docs/design/2026-09-12-prose-code-math-styling.md）。
 *
 * 两条铁律（都来自实测翻车教训，写进了测试策略 §6）：
 * 1. 颜色只认 getComputedStyle / 像素采样，绝不靠肉眼或截图判断；
 * 2. Shiki 双主题下「计算值 ≠ 内联值」：内联 style 永远是浅色值，
 *    深色来自 CSS 变量 + !important —— 两者必须分别断言。
 */
test.use({ viewport: { width: 1440, height: 900 } });

/** WCAG 相对亮度与对比度（Node 侧计算，页面只回传颜色字符串）。 */
function luminance(rgb: { r: number; g: number; b: number }): number {
  const channel = (raw: number) => {
    const value = raw / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

function contrast(fg: string, bg: string): number {
  const parse = (value: string) => {
    const match = value.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
    if (!match) throw new Error(`无法解析颜色：${value}`);
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
  };
  const l1 = luminance(parse(fg));
  const l2 = luminance(parse(bg));
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

test('代码块渲染深色底且 data-language 由 Astro 写入', async ({ page }) => {
  await page.goto('notes/rich-content/');
  const blocks = page.locator('.prose pre.astro-code');
  const count = await blocks.count();
  expect(count).toBeGreaterThanOrEqual(2);

  for (let index = 0; index < count; index += 1) {
    const block = blocks.nth(index);
    // data-language 是 Astro 无条件写入的（@astrojs/internal-helpers shiki.js），
    // 这里断言的是「存在且非空」，不需要任何自定义 transformer。
    const language = await block.getAttribute('data-language');
    expect(language?.length ?? 0).toBeGreaterThan(0);

    const colors = await block.evaluate((el) => ({
      computed: getComputedStyle(el).backgroundColor,
      inline: el.style.backgroundColor,
    }));
    // 计算值：深色（RGB 分量之和远小于浅色主题的白底 765）
    const sum = colors.computed.match(/(\d+)/g)?.slice(0, 3).reduce((acc, n) => acc + Number(n), 0) ?? 765;
    expect(sum, '计算出的底色应为深色').toBeLessThan(200);
    // 内联值：Shiki 写入的浅色主题底（github-light 白底）—— 证明覆盖来自 CSS 而非内联被改写
    expect(colors.inline).toContain('255');
  }
});

test('代码文字颜色同样来自双主题变量（计算值 ≠ 内联值）', async ({ page }) => {
  await page.goto('notes/rich-content/');
  const block = page.locator('.prose pre.astro-code').first();
  const colors = await block.evaluate((el) => ({
    computed: getComputedStyle(el).color,
    inline: el.style.color,
  }));
  // 内联是浅色主题的深色文字（github-light #24292f），计算值应是深底上的浅字
  const sum = colors.computed.match(/(\d+)/g)?.slice(0, 3).reduce((acc, n) => acc + Number(n), 0) ?? 0;
  expect(sum, '计算出的文字色应为浅色').toBeGreaterThan(400);
  expect(colors.inline).not.toBe(colors.computed);
});

test('超长单行代码横向滚动而非折行', async ({ page }) => {
  await page.goto('notes/rich-content/');
  const block = page.locator('.prose pre', { hasText: 'hyperparameters' });
  await expect(block).toBeVisible();
  const overflow = await block.evaluate((el) => ({
    overflowX: getComputedStyle(el).overflowX,
    scroll: el.scrollWidth,
    client: el.clientWidth,
  }));
  expect(overflow.overflowX).toBe('auto');
  expect(overflow.scroll).toBeGreaterThan(overflow.client);
});

test('独立公式渲染并支持超宽横向滚动', async ({ page }) => {
  await page.goto('notes/rich-content/');
  const displays = page.locator('.prose .katex-display');
  expect(await displays.count()).toBeGreaterThanOrEqual(2);
  const overflow = await displays.last().evaluate((el) => ({
    overflowX: getComputedStyle(el).overflowX,
    scroll: el.scrollWidth,
    client: el.clientWidth,
  }));
  // fixture 最后一条公式刻意超出 72ch 正文宽度
  expect(overflow.overflowX).toBe('auto');
  expect(overflow.scroll).toBeGreaterThan(overflow.client);
});

test('语言标签与复制按钮对比度 ≥ 4.5:1（AA）', async ({ page }) => {
  await page.goto('notes/rich-content/');
  const block = page.locator('.prose pre.astro-code').first();
  await block.hover();

  const sample = await block.evaluate((el) => {
    const label = getComputedStyle(el, '::before');
    const button = el.querySelector<HTMLElement>('.code-copy');
    return {
      labelColor: label.color,
      backgroundColor: getComputedStyle(el).backgroundColor,
      buttonColor: button ? getComputedStyle(button).color : null,
      buttonBackground: button ? getComputedStyle(button).backgroundColor : null,
    };
  });

  // 语言标签是 rgba 浅色叠在深色块上 —— 浏览器已报告其颜色，直接参与对比
  const labelRatio = contrast(sample.labelColor, sample.backgroundColor);
  expect(labelRatio, `语言标签对比度 ${labelRatio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);

  expect(sample.buttonColor).toBeTruthy();
  // 复制按钮的半透明底先合成到深色块底上，再与文字色对比
  const composite = sample.buttonBackground!.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  const bgBase = sample.backgroundColor.match(/(\d+)/g)!.slice(0, 3).map(Number);
  const alpha = composite?.[4] !== undefined ? Number(composite[4]) : 1;
  const mixed = composite!.slice(1, 4).map((n, i) => Math.round(Number(n) * alpha + bgBase[i]! * (1 - alpha)));
  const buttonRatio = contrast(sample.buttonColor!, `rgb(${mixed.join(', ')})`);
  expect(buttonRatio, `复制按钮对比度 ${buttonRatio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
});

test('项目页正文的代码块同样渲染深色底', async ({ page }) => {
  await page.goto('projects/rich-content/');
  const block = page.locator('.prose pre.astro-code').first();
  await expect(block).toBeVisible();
  const bg = await block.evaluate((el) => getComputedStyle(el).backgroundColor);
  const sum = bg.match(/(\d+)/g)?.slice(0, 3).reduce((acc, n) => acc + Number(n), 0) ?? 765;
  expect(sum).toBeLessThan(200);
});
