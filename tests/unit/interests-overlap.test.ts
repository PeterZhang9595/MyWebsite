import { describe, expect, it } from 'vitest';
import {
  CARD_MAX_WIDTH,
  CARD_MIN_WIDTH,
  OVERLAP_RATIO,
  overlapShift,
  railCardWidth,
} from '../../src/lib/interests-overlap';

describe('interests-overlap', () => {
  it('遮盖比例固定为 25%', () => {
    expect(OVERLAP_RATIO).toBe(0.25);
  });

  it('卡宽档位为放大 1.4 倍后的 210 / 273', () => {
    // 三期：右侧卡组整体放大 ×1.4（原 150 / 195 → 210 / 273），并改为右压左层叠。
    expect(CARD_MIN_WIDTH).toBe(210);
    expect(CARD_MAX_WIDTH).toBe(273);
  });

  it('overlapShift 返回宽度的 25%', () => {
    expect(overlapShift(200)).toBeCloseTo(50, 5);
    expect(overlapShift(160)).toBeCloseTo(40, 5);
    expect(overlapShift(273)).toBeCloseTo(68.25, 5);
  });

  it('overlapShift 对非法输入返回 0（不返回 NaN）', () => {
    expect(overlapShift(Number.NaN)).toBe(0);
    expect(overlapShift(Number.POSITIVE_INFINITY)).toBe(0);
    expect(overlapShift(-10)).toBe(0);
  });

  it('overlapShift(0) 为 0', () => {
    expect(overlapShift(0)).toBe(0);
  });

  it('railCardWidth 在视口窄时取下限 210', () => {
    expect(railCardWidth(400)).toBeCloseTo(210, 5);
  });

  it('railCardWidth 在中间视口按 23.8vw 取值', () => {
    // 23.8vw of 1200 = 285.6 → 超过上限 273，取 273
    expect(railCardWidth(1200)).toBeCloseTo(273, 5);
    // 23.8vw of 1000 = 238 → 落在区间内
    expect(railCardWidth(1000)).toBeCloseTo(238, 5);
  });

  it('railCardWidth 在超宽视口取上限 273', () => {
    expect(railCardWidth(3000)).toBeCloseTo(273, 5);
  });

  it('railCardWidth 随视口单调不减', () => {
    const samples = [320, 600, 900, 1000, 1200, 1600, 2400];
    const values = samples.map((width) => railCardWidth(width));
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });
});
