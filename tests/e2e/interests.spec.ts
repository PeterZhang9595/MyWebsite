import { expect, test } from '@playwright/test';

/**
 * Interests 卡牌化 E2E。
 *
 * 覆盖一期（卡牌化）与二期（增强：重叠卡组 / justified 图片墙 / 整页渐变 / 浮层长文）
 * 的验收要求。二期断言见文件末尾的「二期」分组。
 */

/** 打开第一张卡牌并等待浮层进入放大态。 */
async function openOverlay(page: import('@playwright/test').Page) {
  await page.locator('.flip-card').first().click();
  const overlay = page.locator('.interests-overlay');
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveAttribute('data-state', 'zoomed');
  return overlay;
}

/** 取元素盒模型；拿不到时直接失败，避免后续断言出现 null 报错。 */
async function boxOf(locator: import('@playwright/test').Locator) {
  const box = await locator.boundingBox();
  expect(box, '元素应当可见并有盒模型').not.toBeNull();
  return box!;
}

/** 取视口尺寸；拿不到时直接失败。 */
function viewportOf(page: import('@playwright/test').Page) {
  const size = page.viewportSize();
  expect(size, '视口尺寸应当可用').not.toBeNull();
  return size!;
}

test.describe('兴趣主页', () => {
  test('上半渲染两张可点击大图', async ({ page }) => {
    await page.goto('interests/');
    const heroes = page.locator('[data-hero-pair] .flip-card--hero');
    await expect(heroes).toHaveCount(2);
    for (let index = 0; index < 2; index += 1) {
      await expect(heroes.nth(index)).toBeVisible();
      await expect(heroes.nth(index)).toHaveAttribute('data-flip-title', /.+/);
    }
  });

  test('主页完全占据整个页面（宽版布局）', async ({ page }) => {
    await page.goto('interests/');
    const main = page.locator('main.content-page--wide');
    await expect(main).toBeVisible();
    const ratio = await main.evaluate(
      (element) => element.getBoundingClientRect().width / window.innerWidth,
    );
    expect(ratio).toBeGreaterThan(0.71);
    expect(ratio).toBeLessThan(0.86);
  });

  test('点击大图进入放大态，再点翻面，再点复原', async ({ page }) => {
    await page.goto('interests/');
    const overlay = await openOverlay(page);

    await expect(overlay.locator('.interests-overlay__front')).toBeVisible();
    await expect(overlay.locator('[data-hint]')).toContainText('翻开');

    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    await expect(overlay).toHaveAttribute('data-state', 'flipped');
    await expect(overlay.locator('[data-title]')).toHaveText('Fixture 左图');
    await expect(overlay.locator('[data-body]')).toContainText('Fixture 左图介绍正文。');

    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    await expect(overlay).toBeHidden();
  });

  test('Esc 可关闭浮层并归还焦点', async ({ page }) => {
    await page.goto('interests/');
    const first = page.locator('.flip-card').first();
    await first.click();
    await expect(page.locator('.interests-overlay')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.interests-overlay')).toBeHidden();
    await expect(first).toBeFocused();
  });

  test('下半滑轨承载一张引导卡与六个类别卡', async ({ page }) => {
    await page.goto('interests/');
    const rail = page.locator('[data-card-rail]');
    await expect(rail).toBeVisible();
    await expect(rail.locator('.interests-rail__lead')).toHaveCount(1);
    const track = rail.locator('.card-rail__track');
    await expect(track.locator('> *').first()).toHaveClass(/interests-rail__lead/);
    await expect(rail.locator('.rail-card')).toHaveCount(6);
    await expect(rail.locator('.rail-card__title')).toHaveText([
      'Fixture 运动', 'Fixture 随笔', 'Fixture 音乐',
      'Fixture 影视', 'Fixture 阅读', 'Fixture 生活中的医学',
    ]);
    await expect(rail.locator('.rail-card').nth(0)).toHaveAttribute('style', /--frame: #D4537E/);
    await expect(rail.locator('.rail-card').nth(1)).toHaveAttribute('style', /--frame: #7F77DD/);
    await expect(rail.locator('.rail-card__meta').nth(0)).toHaveText('8 张卡');
    await expect(rail.locator('.rail-card__meta').nth(1)).toHaveText('1 张卡');
  });

  test('滑轨可横向滚动（内容宽于容器）', async ({ page }) => {
    await page.goto('interests/');
    const track = page.locator('.card-rail__track');
    await expect(track).toBeVisible();
    // 等卡片就位再量，避免并行 worker 下布局未稳定时读到中间态。
    await expect(page.locator('.rail-card')).toHaveCount(6);
    const overflow = await track.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(overflow).toBeGreaterThan(0);
    // 滚到 200 后断言确实滚动过（用轮询容忍滚动平滑与重排的时间差）。
    await track.evaluate((element) => element.scrollTo({ left: 200, behavior: 'instant' }));
    await expect
      .poll(() => track.evaluate((element) => element.scrollLeft), { timeout: 10_000 })
      .toBeGreaterThan(0);
  });

  test('点击类别卡进入对应分类页', async ({ page }) => {
    await page.goto('interests/');
    // 卡片相互重叠，必须点可见区（左侧 75%）的中心，避免落在被上层卡遮盖的位置。
    const target = page.locator('.rail-card', { hasText: '运动' });
    await expect(target).toBeVisible();
    await target.click({ position: { x: 40, y: 40 } });
    await expect(page).toHaveURL(/interests\/sports\/$/);
    await expect(page.locator('.interests-wall')).toBeVisible();
  });
});

test.describe('兴趣分类页', () => {
  test('渲染内容声明的图片数量', async ({ page }) => {
    await page.goto('interests/sports/');
    await expect(page.locator('.interests-wall .flip-card')).toHaveCount(8);
    await expect(page.locator('.interests-category__count')).toHaveText('8 张图片');
  });

  test('缺少 image 时渲染 CSS 占位而非破图', async ({ page }) => {
    await page.goto('interests/sports/');
    const card = page.locator('.interests-wall .flip-card').last();
    await expect(card.locator('.flip-card__image')).toHaveCount(0);
    await expect(card.locator('.flip-card__placeholder-mark')).toHaveText('F');
  });

  test('图片使用调色板帧色，显式声明优先', async ({ page }) => {
    await page.goto('interests/sports/');
    const cards = page.locator('.interests-wall .flip-card');
    await expect(cards.nth(0)).toHaveAttribute('style', /--frame: #D4537E/);
    await expect(cards.nth(1)).toHaveAttribute('style', /--frame: #7F77DD/);
    await expect(cards.nth(2)).toHaveAttribute('style', /--frame: #112233/);
  });

  test('图注左侧色条由 --frame 派生', async ({ page }) => {
    await page.goto('interests/sports/');
    const caption = page.locator('.interests-wall .flip-card').first().locator('.flip-card__caption');
    await expect(caption).toHaveCSS('border-left-color', 'rgb(212, 83, 126)');
    await expect(caption).toHaveCSS('border-left-width', '3px');
  });

  test('悬停当前图时其余图灰化', async ({ page }) => {
    await page.goto('interests/sports/');
    const wall = page.locator('.interests-wall');
    await wall.hover({ position: { x: 5, y: 5 } });
    const others = page.locator('.interests-wall .flip-card:not(:hover)');
    if ((await others.count()) > 0) {
      await expect(others.first()).toHaveCSS('filter', /grayscale\(/);
    }
  });

  test('分类页存在糖果粉紫渐变背景层', async ({ page }) => {
    await page.goto('interests/sports/');
    const gradient = page.locator('.interests-gradient');
    await expect(gradient).toBeAttached();
    await expect(gradient).toHaveCSS('pointer-events', 'none');
    const background = await gradient.evaluate(
      (element) => getComputedStyle(element).backgroundImage,
    );
    expect(background).toContain('gradient');
  });

  test('图片点击放大 / 翻面 / 复原，Esc 可关闭', async ({ page }) => {
    await page.goto('interests/sports/');
    const overlay = await openOverlay(page);
    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    await expect(overlay.locator('[data-title]')).toHaveText('Fixture 方形图');
    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden();
  });
});

test.describe('兴趣页双语', () => {
  test('英文主页渲染英文引导文案与类别', async ({ page }) => {
    await page.goto('en/interests/');
    await expect(page.locator('.rail-card', { hasText: 'Sports' })).toBeVisible();
    await expect(page.locator('[data-hero-pair] .flip-card--hero')).toHaveCount(2);
  });

  test('英文分类页渲染英文图片与计数', async ({ page }) => {
    const response = await page.goto('en/interests/sports/');
    expect(response?.status()).toBe(200);
    await expect(page.locator('.interests-wall .flip-card')).toHaveCount(8);
    await expect(page.locator('.interests-category__count')).toHaveText('8 images');
  });

  test('英文浮层提示为英文', async ({ page }) => {
    await page.goto('en/interests/sports/');
    const overlay = await openOverlay(page);
    await expect(overlay.locator('[data-hint]')).toContainText('flip');
    await expect(overlay).toHaveAttribute('aria-label', 'Enlarged view');
  });

  test('英文计数单数用 card、复数用 cards', async ({ page }) => {
    await page.goto('en/interests/');
    await expect(page.locator('.rail-card__meta').nth(0)).toHaveText('8 cards');
    await expect(page.locator('.rail-card__meta').nth(1)).toHaveText('1 card');
    await page.goto('en/interests/essay/');
    await expect(page.locator('.interests-category__count')).toHaveText('1 image');
  });
});

/* ------------------------------------------------------------------ *
 * 二期增强
 * ------------------------------------------------------------------ */

test.describe('二期 · 主页重叠卡组', () => {
  test('不再渲染与卡片重复的分区标题', async ({ page }) => {
    await page.goto('interests/');
    await expect(page.locator('.interests-rail__title')).toHaveCount(0);
    await expect(page.locator('.interests-rail__header')).toHaveCount(0);
    // 地标仍有可读名称
    await expect(page.locator('section.interests-rail')).toHaveAttribute(
      'aria-label',
      '乱七八糟的各种东西',
    );
    // 整个页面不应再出现该文案（避免与卡片重复）
    const h2 = page.locator('main h2', { hasText: '乱七八糟的各种东西' });
    await expect(h2).toHaveCount(0);
  });

  test('左引导卡与右侧卡组之间留有间隔', async ({ page }) => {
    await page.goto('interests/');
    const gap = await page.evaluate(() => {
      const lead = document.querySelector('.interests-rail__lead');
      const firstCard = document.querySelector('.rail-card');
      if (!lead || !firstCard) return -1;
      return firstCard.getBoundingClientRect().left - lead.getBoundingClientRect().right;
    });
    expect(gap).toBeGreaterThan(20);
  });

  test('左引导卡为 3:4 竖版并带渐变边框', async ({ page }) => {
    await page.goto('interests/');
    const lead = page.locator('.interests-rail__lead');
    const box = await boxOf(lead);
    // 3:4 → 高 / 宽 ≈ 1.333
    expect(box.height / box.width).toBeGreaterThan(1.28);
    expect(box.height / box.width).toBeLessThan(1.39);
    const before = await lead.evaluate(
      (element) => getComputedStyle(element, '::before').backgroundImage,
    );
    expect(before).toContain('gradient');
  });

  test('右侧卡片为 1:1 正方形', async ({ page }) => {
    await page.goto('interests/');
    const cards = page.locator('.rail-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(1);
    for (let index = 0; index < Math.min(count, 3); index += 1) {
      const box = await boxOf(cards.nth(index));
      expect(box.height / box.width).toBeGreaterThan(0.95);
      expect(box.height / box.width).toBeLessThan(1.05);
    }
  });

  test('右侧卡片已放大 1.4 倍（1440 视口下取上限 273）', async ({ page }) => {
    await page.goto('interests/');
    const box = await boxOf(page.locator('.rail-card').first());
    // 原上限 195 → ×1.4 = 273
    expect(box.width).toBeGreaterThanOrEqual(272);
    expect(box.width).toBeLessThanOrEqual(274);
  });

  test('相邻卡片水平重叠约 25%', async ({ page }) => {
    await page.goto('interests/');
    const cards = page.locator('.rail-card');
    const first = await boxOf(cards.nth(0));
    const second = await boxOf(cards.nth(1));
    const overlap = first.x + first.width - second.x;
    expect(overlap / first.width).toBeGreaterThan(0.2);
    expect(overlap / first.width).toBeLessThan(0.3);
  });

  test('卡片色块贴左上角，且不含任何单字', async ({ page }) => {
    await page.goto('interests/');
    const card = page.locator('.rail-card').first();
    const frame = card.locator('.rail-card__frame');
    await expect(frame).toHaveCount(1);
    // 色块只作视觉标识，不含任何文字
    await expect(frame).toHaveText('');
    await expect(frame).toHaveAttribute('aria-hidden', 'true');
    // 贴左上角：左侧只留一点呼吸感（远小于被遮盖的 25%）
    const insets = await card.evaluate((element) => {
      const cardRect = element.getBoundingClientRect();
      const frameRect = element.querySelector('.rail-card__frame')!.getBoundingClientRect();
      return {
        left: frameRect.left - cardRect.left,
        top: frameRect.top - cardRect.top,
        cardWidth: cardRect.width,
      };
    });
    expect(insets.left).toBeLessThan(insets.cardWidth * 0.09);
    expect(insets.top).toBeLessThan(insets.cardWidth * 0.09);
  });

  test('卡片标题与计数仍然渲染', async ({ page }) => {
    await page.goto('interests/');
    const first = page.locator('.rail-card').first();
    await expect(first.locator('.rail-card__title')).not.toHaveText('');
    await expect(first.locator('.rail-card__meta')).toContainText('张卡');
  });

  test('标题完整落在可见区内，不被后一张卡裁切', async ({ page }) => {
    await page.goto('interests/');
    // 等轨道内卡片渲染完再做几何量测，避免布局未稳定时读到中间态。
    await expect(page.locator('.rail-card')).toHaveCount(6);
    const clipped = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.rail-card')];
      return cards.map((card, index) => {
        const next = card.nextElementSibling as HTMLElement | null;
        if (!next) return { index, fits: true };
        const nextLeft = next.getBoundingClientRect().left;
        const title = card.querySelector('.rail-card__title');
        if (!title) return { index, fits: false, reason: 'no title' };
        const range = document.createRange();
        range.selectNodeContents(title);
        const textRect = range.getBoundingClientRect();
        // 右压左：可见区右边界即后一张卡的左边界
        return { index, fits: textRect.right <= nextLeft + 1 };
      });
    });
    for (const item of clipped) {
      expect(item.fits, `第 ${item.index} 张卡标题应完整可见`).toBe(true);
    }
  });

  test('左引导卡文案为「乱七八糟的东西」', async ({ page }) => {
    await page.goto('interests/');
    await expect(page.locator('.interests-rail__lead-text')).toHaveText('乱七八糟的东西');
  });

  test('悬浮卡片时后方卡片右推让位', async ({ page }) => {
    await page.goto('interests/');
    const cards = page.locator('.rail-card');
    // 右压左：第 1 张卡的右侧被第 2 张盖着，悬浮第 1 张时第 2 张应右推让位。
    const secondBefore = await boxOf(cards.nth(1));
    await cards.nth(0).hover();
    await page.waitForTimeout(400);
    const secondAfter = await boxOf(cards.nth(1));
    expect(secondAfter.x).toBeGreaterThan(secondBefore.x + 10);
  });

  test('越靠右的卡片层级越高', async ({ page }) => {
    await page.goto('interests/');
    const zFirst = await page
      .locator('.rail-card')
      .nth(0)
      .evaluate((element) => Number(getComputedStyle(element).zIndex));
    const zSecond = await page
      .locator('.rail-card')
      .nth(1)
      .evaluate((element) => Number(getComputedStyle(element).zIndex));
    expect(zSecond).toBeGreaterThan(zFirst);
  });

  test('重叠处最上层是右侧那张卡', async ({ page }) => {
    await page.goto('interests/');
    // 轨道在首屏之下，elementFromPoint 只认视口内的坐标，必须先滚进视野。
    await page.locator('.card-rail__track').scrollIntoViewIfNeeded();
    const topIndex = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('.rail-card')];
      const r0 = cards[0].getBoundingClientRect();
      const r1 = cards[1].getBoundingClientRect();
      const midX = (r1.left + r0.right) / 2;
      const midY = r1.top + r1.height / 2;
      if (midY < 0 || midY > window.innerHeight) return -2;
      const el = document.elementFromPoint(midX, midY);
      const owner = el?.closest('.rail-card');
      return owner ? cards.indexOf(owner as Element) : -1;
    });
    expect(topIndex).toBe(1);
  });
});

test.describe('二期 · 子页整页渐变与面包屑', () => {
  test('渐变层铺满整个视口而不是中间区域', async ({ page }) => {
    await page.goto('interests/sports/');
    const box = await boxOf(page.locator('.interests-gradient'));
    const viewport = viewportOf(page);
    expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height - 1);
    await expect(page.locator('.interests-gradient')).toHaveCSS('position', 'fixed');
  });

  test('滚动到底部后渐变仍覆盖视口', async ({ page }) => {
    await page.goto('interests/sports/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const box = await boxOf(page.locator('.interests-gradient'));
    const viewport = viewportOf(page);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height - 1);
  });

  test('面包屑去掉了高亮底与边框', async ({ page }) => {
    await page.goto('interests/sports/');
    const line = page.locator('.terminal-path__line');
    const styles = await line.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        backgroundImage: computed.backgroundImage,
        backgroundColor: computed.backgroundColor,
        borderTopWidth: computed.borderTopWidth,
        borderBottomWidth: computed.borderBottomWidth,
        borderLeftWidth: computed.borderLeftWidth,
        borderRightWidth: computed.borderRightWidth,
      };
    });
    expect(styles.backgroundImage).toBe('none');
    expect(['transparent', 'rgba(0, 0, 0, 0)']).toContain(styles.backgroundColor);
    expect(styles.borderTopWidth).toBe('0px');
    expect(styles.borderBottomWidth).toBe('0px');
    expect(styles.borderLeftWidth).toBe('0px');
    expect(styles.borderRightWidth).toBe('0px');
  });

  test('其它页面的面包屑保持原有高亮底', async ({ page }) => {
    await page.goto('notes/');
    const background = await page
      .locator('.terminal-path__line')
      .first()
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(background).not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('二期 · justified 图片墙', () => {
  test('同一行内图片等高', async ({ page }) => {
    await page.goto('interests/sports/');
    const rows = page.locator('.interests-wall__row');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let index = 0; index < rowCount; index += 1) {
      const heights = await rows
        .nth(index)
        .locator('.flip-card__front')
        .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
      const min = Math.min(...heights);
      const max = Math.max(...heights);
      expect(max - min).toBeLessThanOrEqual(1.5);
    }
  });

  test('每行（末行铺满时）总宽等于墙宽', async ({ page }) => {
    await page.goto('interests/sports/');
    const wallWidth = await page
      .locator('.interests-wall')
      .evaluate((element) => element.getBoundingClientRect().width);
    const rows = page.locator('.interests-wall__row');
    const rowCount = await rows.count();
    for (let index = 0; index < rowCount; index += 1) {
      const row = rows.nth(index);
      const cards = row.locator('.flip-card');
      const cardCount = await cards.count();
      const total = await cards.evaluateAll((elements) =>
        elements.reduce((sum, element) => sum + element.getBoundingClientRect().width, 0),
      );
      const gap = await row.evaluate((element) =>
        parseFloat(getComputedStyle(element).columnGap || '0') || 0,
      );
      const used = total + gap * Math.max(0, cardCount - 1);
      // 末行允许留白（不拉伸），其余行必须铺满
      if (index < rowCount - 1) {
        expect(Math.abs(used - wallWidth)).toBeLessThanOrEqual(2);
      } else {
        expect(used).toBeLessThanOrEqual(wallWidth + 2);
      }
    }
  });

  test('不同宽高比的图片按原始比例渲染', async ({ page }) => {
    await page.goto('interests/sports/');
    // fixture 前四张：1:1 / 4:3 / 3:2 / 16:9
    // 量图片区（.flip-card__front）而不是整卡：整卡还包含下方图注。
    const expected = [1, 4 / 3, 3 / 2, 16 / 9];
    const fronts = page.locator('.interests-wall .flip-card--sized .flip-card__front');
    for (let index = 0; index < expected.length; index += 1) {
      const box = await boxOf(fronts.nth(index));
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - expected[index])).toBeLessThan(0.03);
    }
  });

  test('竖版图片保持竖版比例', async ({ page }) => {
    await page.goto('interests/sports/');
    const fronts = page.locator('.interests-wall .flip-card--sized .flip-card__front');
    // fixture 后四张：2:3 / 3:4 / 3:1 / (无图卡不进 sized，故只断言前三张)
    const expected = [2 / 3, 3 / 4, 3];
    for (let index = 0; index < expected.length; index += 1) {
      const box = await boxOf(fronts.nth(index + 4));
      const ratio = box.width / box.height;
      expect(Math.abs(ratio - expected[index])).toBeLessThan(0.05);
    }
  });

  test('图片使用 contain 而非裁切', async ({ page }) => {
    await page.goto('interests/sports/');
    const objectFit = await page
      .locator('.interests-wall .flip-card__image')
      .first()
      .evaluate((element) => getComputedStyle(element).objectFit);
    expect(['contain', 'fill']).toContain(objectFit);
  });

  test('图注渲染标题但不再展示时间', async ({ page }) => {
    await page.goto('interests/sports/');
    const first = page.locator('.interests-wall .flip-card').first();
    await expect(first.locator('.flip-card__title')).toHaveText('Fixture 方形图');
    // 时间格式（YYYY.MM）不应出现在任何图注里
    const captions = await page.locator('.interests-wall .flip-card__caption').allTextContents();
    for (const caption of captions) {
      expect(caption).not.toMatch(/\d{4}\.\d{2}/);
    }
  });

  test('支持大量图片（行数随数量增长且不丢失图片）', async ({ page }) => {
    await page.goto('interests/sports/');
    const rows = await page.locator('.interests-wall__row').count();
    const cards = await page.locator('.interests-wall .flip-card').count();
    expect(cards).toBe(8);
    expect(rows).toBeGreaterThanOrEqual(2);
  });
});

test.describe('二期 · 放大浮层', () => {
  test('放大态图片保持原始宽高比', async ({ page }) => {
    await page.goto('interests/sports/');
    await openOverlay(page);
    const objectFit = await page
      .locator('.interests-overlay__front-media img')
      .evaluate((element) => getComputedStyle(element).objectFit);
    expect(objectFit).toBe('contain');
  });

  test('翻面后长文在独立容器内可上下滚动', async ({ page }) => {
    await page.goto('interests/sports/');
    const overlay = await openOverlay(page);
    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    await expect(overlay).toHaveAttribute('data-state', 'flipped');

    const region = overlay.locator('.interests-overlay__back-scroll');
    await expect(region).toBeVisible();
    // 容器自身可滚动（内容溢出时）或至少声明了 overflow-y: auto
    const overflowY = await region.evaluate((element) => getComputedStyle(element).overflowY);
    expect(overflowY).toBe('auto');
    const canScroll = await region.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    );
    if (canScroll) {
      await region.evaluate((element) => {
        element.scrollTop = 100;
      });
      await expect
        .poll(() => region.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
    }
  });

  test('背面长文按段落渲染', async ({ page }) => {
    await page.goto('interests/sports/');
    const overlay = await openOverlay(page);
    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    await expect(overlay.locator('.interests-overlay__back-body').first()).toHaveText(
      'Fixture 方形图的背面正文。',
    );
  });

  test('背面滚动区可键盘聚焦且带无障碍名称', async ({ page }) => {
    await page.goto('interests/sports/');
    const overlay = await openOverlay(page);
    await overlay.locator('.interests-overlay__stage').click({ position: { x: 5, y: 5 } });
    const region = overlay.locator('.interests-overlay__back-scroll');
    await expect(region).toHaveAttribute('tabindex', '0');
    await expect(region).toHaveAttribute('aria-label', /.+/);
  });
});
