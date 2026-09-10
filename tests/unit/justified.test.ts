import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGET_HEIGHT, justify, LAST_ROW_TOLERANCE } from '../../src/lib/justified';

const GAP = 16;

function widthsOf(row: ReturnType<typeof justify>[number]): number[] {
  return row.items.map((item) => item.width);
}

describe('justify', () => {
  it('空数组返回空结果', () => {
    expect(justify([], 1000, GAP, 260)).toEqual([]);
    expect(justify([] as number[], 1000, GAP)).toEqual([]);
  });

  it('单张图铺满整行（末行阈值内会拉伸）', () => {
    // 单张 4:3 图，行高 = (1000 - 0) / (4/3) = 750；stretch = 750/260 > TOL → 保持目标行高
    const rows = justify([4 / 3], 1000, GAP, 260);
    expect(rows).toHaveLength(1);
    expect(rows[0].height).toBeCloseTo(260, 5);
    // 宽度按比例得出
    expect(rows[0].items[0].width).toBeCloseTo(260 * (4 / 3), 5);
  });

  it('同一行内所有图片高度一致', () => {
    const ratios = [1, 4 / 3, 3 / 2, 16 / 9, 1, 4 / 3, 1];
    const rows = justify(ratios, 1000, GAP, 260);
    for (const row of rows) {
      for (const item of row.items) {
        expect(item.height).toBeCloseTo(row.height, 5);
      }
    }
  });

  it('每行（除末行）总宽等于容器宽（允许浮点误差）', () => {
    const ratios = [1, 4 / 3, 3 / 2, 16 / 9, 2 / 3, 3 / 4, 1, 4 / 3, 1.2, 0.8];
    const rows = justify(ratios, 1000, GAP, 260);
    for (let i = 0; i < rows.length - 1; i += 1) {
      const total = widthsOf(rows[i]).reduce((sum, w) => sum + w, 0) + GAP * (rows[i].items.length - 1);
      expect(total).toBeCloseTo(1000, 3);
    }
  });

  it('图片按输入顺序连续分配（不重排、不丢失）', () => {
    const ratios = [1, 4 / 3, 3 / 2, 16 / 9, 2 / 3, 3 / 4];
    const rows = justify(ratios, 1000, GAP, 260);
    const flat = rows.flatMap((row) => row.items.map((item) => item.ratio));
    expect(flat).toEqual(ratios);
  });

  it('索引与原数组一致', () => {
    const ratios = [1, 4 / 3, 3 / 2, 16 / 9, 2 / 3, 3 / 4, 1.1];
    const rows = justify(ratios, 900, GAP, 260);
    const flat = rows.flatMap((row) => row.items.map((item) => item.index));
    expect(flat).toEqual(ratios.map((_, index) => index));
  });

  it('未定义目标行高时使用默认值', () => {
    const rows = justify([1, 1, 1, 1, 1, 1], 1000, GAP);
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.height).toBeGreaterThan(0);
    }
    expect(DEFAULT_TARGET_HEIGHT).toBeGreaterThan(0);
  });

  it('末行失衡超过阈值时保持目标行高，不强行铺满', () => {
    // 前三张 4:3 横图刚好定一行（行高 246 ≤ 260）；
    // 末行只剩一张极宽的 10:1 图，强行铺满行高仅 100 → 相对目标 0.38 倍，
    // 渲染出来就是一条极窄的扁片 → 应放弃拉伸、保持目标行高。
    const ratios = [4 / 3, 4 / 3, 4 / 3, 10];
    const rows = justify(ratios, 1000, GAP, 260);
    const last = rows[rows.length - 1];
    expect(last.items).toHaveLength(1);
    expect(last.height).toBeCloseTo(260, 5);
    expect(last.stretched).toBe(false);
    // 未被拉伸时宽度按目标行高算，而不是撑满容器
    expect(last.items[0].width).toBeCloseTo(260 * 10, 5);
  });

  it('末行失衡在阈值内时铺满容器宽', () => {
    const ratios = [1, 1, 1, 1, 1, 1, 1, 1];
    const rows = justify(ratios, 1000, GAP, 260);
    const last = rows[rows.length - 1];
    if (last.stretched) {
      const total = widthsOf(last).reduce((sum, w) => sum + w, 0) + GAP * (last.items.length - 1);
      expect(total).toBeCloseTo(1000, 3);
    }
  });

  it('标记 stretched 与实际高度自洽', () => {
    const ratios = [1, 4 / 3, 3 / 2, 16 / 9, 2 / 3, 3 / 4, 5, 1, 1];
    const rows = justify(ratios, 1000, GAP, 260);
    for (const row of rows) {
      if (row.stretched) {
        const natural = (1000 - GAP * (row.items.length - 1)) / row.items.reduce((s, i) => s + i.ratio, 0);
        expect(row.height).toBeCloseTo(natural, 5);
        expect(natural / 260).toBeLessThanOrEqual(LAST_ROW_TOLERANCE + 1e-9);
      } else {
        expect(row.height).toBeCloseTo(260, 5);
      }
    }
  });

  it('容器过窄时不会产出空行或死循环', () => {
    const ratios = [1, 1, 1];
    const rows = justify(ratios, 100, GAP, 260);
    const count = rows.flatMap((row) => row.items).length;
    expect(count).toBe(3);
  });

  it('极端比例（10:1 与 1:10）不产生负宽或 NaN', () => {
    const ratios = [10, 1 / 10, 10, 1 / 10, 1];
    const rows = justify(ratios, 1000, GAP, 260);
    for (const row of rows) {
      expect(Number.isFinite(row.height)).toBe(true);
      expect(row.height).toBeGreaterThan(0);
      for (const item of row.items) {
        expect(Number.isFinite(item.width)).toBe(true);
        expect(item.width).toBeGreaterThan(0);
      }
    }
    expect(rows.flatMap((row) => row.items)).toHaveLength(5);
  });

  it('支持大量图片（线性、不丢失）', () => {
    const ratios = Array.from({ length: 500 }, (_, index) => [1, 4 / 3, 3 / 2, 2 / 3][index % 4]);
    const rows = justify(ratios, 1200, 16, 260);
    expect(rows.flatMap((row) => row.items)).toHaveLength(500);
    expect(rows.length).toBeGreaterThan(50);
  });

  it('非法宽高比按 4:3 兜底', () => {
    const rows = justify([0, -1, Number.NaN, 4 / 3], 1000, GAP, 260);
    const flat = rows.flatMap((row) => row.items);
    expect(flat).toHaveLength(4);
    expect(flat[0].ratio).toBeCloseTo(4 / 3, 5);
    expect(flat[1].ratio).toBeCloseTo(4 / 3, 5);
    expect(flat[2].ratio).toBeCloseTo(4 / 3, 5);
  });
});
