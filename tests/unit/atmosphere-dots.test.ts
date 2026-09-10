import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { makeDots } from '../../src/lib/atmosphere-dots';

const componentSource = readFileSync(
  resolve(__dirname, '../../src/components/content/ProjectAtmosphere.astro'),
  'utf8',
);

describe('makeDots', () => {
  it('produces the requested number of dots', () => {
    expect(makeDots(1500)).toHaveLength(1500);
    expect(makeDots(0)).toHaveLength(0);
  });

  it('keeps every dot inside its documented ranges', () => {
    const dots = makeDots(400);
    for (const d of dots) {
      expect(d.x, `x`).toBeGreaterThanOrEqual(0);
      expect(d.x, `x`).toBeLessThanOrEqual(100);
      expect(d.y, `y`).toBeGreaterThanOrEqual(0);
      expect(d.y, `y`).toBeLessThanOrEqual(100);
      expect(d.size, `size`).toBeGreaterThanOrEqual(2); // 可见度下限
      expect(d.size, `x`).toBeLessThanOrEqual(4.5);
      expect(d.opacity, `opacity`).toBeGreaterThanOrEqual(0.12);
      expect(d.opacity, `opacity`).toBeLessThanOrEqual(0.26);
      expect(d.delay, `delay`).toBeGreaterThanOrEqual(0);
      expect(d.delay, `delay`).toBeLessThanOrEqual(4);
      expect(d.duration, `duration`).toBeGreaterThanOrEqual(6);
      expect(d.duration, `duration`).toBeLessThanOrEqual(12);
    }
  });

  it('is deterministic for a fixed seed', () => {
    const a = makeDots(1500, 20260910);
    const b = makeDots(1500, 20260910);
    expect(a).toEqual(b);
  });

  it('varies positions across dots rather than collapsing to one point', () => {
    const dots = makeDots(1500);
    const xs = new Set(dots.map((d) => d.x));
    const ys = new Set(dots.map((d) => d.y));
    expect(xs.size).toBeGreaterThan(50);
    expect(ys.size).toBeGreaterThan(50);
  });

  it('varies size and opacity instead of a single constant value', () => {
    const dots = makeDots(1500);
    const sizes = new Set(dots.map((d) => d.size));
    const opacities = new Set(dots.map((d) => d.opacity));
    expect(sizes.size).toBeGreaterThan(1);
    expect(opacities.size).toBeGreaterThan(1);
  });

  it('rounds to readable precision (sizes 1 dp, opacity 2 dp)', () => {
    for (const d of makeDots(200)) {
      // 浮点表示会让 0.14*100 出现 14.000000000000002 之类尾差，故用容差而非 isInteger。
      expect(Math.abs(d.size * 10 - Math.round(d.size * 10)), `size ${d.size}`).toBeLessThan(1e-6);
      expect(Math.abs(d.opacity * 100 - Math.round(d.opacity * 100)), `opacity ${d.opacity}`).toBeLessThan(1e-6);
    }
  });

  it('default seed matches the documented 20260910', () => {
    expect(makeDots(1, 20260910)).toEqual(makeDots(1));
  });
});

describe('ProjectAtmosphere component', () => {
  it('renders exactly 1500 dots via makeDots(1500)', () => {
    // 数量由用户聊天（2026-09-10）多次调密度确认：46 → 60 → 300 → 500 → 900 → 1500。
    // 此断言防止有人误调回旧值。
    expect(componentSource).toMatch(/makeDots\(\s*1500\s*\)/);
  });
});