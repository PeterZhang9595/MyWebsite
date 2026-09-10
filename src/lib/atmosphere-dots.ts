/**
 * Project 目录页散点背景氛围层的确定性随机采样。
 *
 * 纯构建期使用：LCG（线性同余）以固定种子产出稳定、可复现的散点序列，
 * 保证每次构建输出一致、无运行时 JS / Canvas。
 *
 * 参数区间按 docs/design/2026-09-10-projects-atmosphere-visibility.md 调整：
 * 直径 2–4.5px、不透明度 0.12–0.26，使散点在两种主题下「隐约可感」而不喧宾。
 * 颜色由调用方用 CSS `var(--text)` 提供，本模块只负责几何与透明度采样。
 *
 * 数量：从初版 46 → §7 调为 60 → §8 调为 300 → §9 调为 500 → §11 调为 900 → §12 调为 1500。
 * 1500 个 LCG 纯随机点在宽版（内容列可达 ~1680px、项目增多后高度可达 3000px+）
 * 下仍保持均匀细腻；页面随项目增加而拉长，密度自然被摊薄，故提高基数。
 * 卡片改为半透明底色后，卡片内的点比卡片外浅（§9）；§11 进一步把卡片底色
 * 从 78% 降到 50%，使卡片内点强度约为卡片外的 50%（见 prose.css / §11）。
 */

export interface Dot {
  x: number; // left %
  y: number; // top %
  size: number; // px
  delay: number; // s
  duration: number; // s
  opacity: number;
}

/** 固定种子的线性同余随机数生成器（返回 0–1）。 */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/** 从 [min, max] 线性插值。 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const round1 = (v: number) => Math.round(v * 10) / 10;
const round2 = (v: number) => Math.round(v * 100) / 100;

/**
 * 生成 count 个散点。seed 相同时序列完全一致（确定性）。
 *
 * - x/y 采样两次随机以保证分布均匀（单次 rand 精度对百分比足够，故用 %）；
 *   实际实现仍用百分比取整到 1 位小数。
 */
export function makeDots(count: number, seed = 20260910): Dot[] {
  const rand = lcg(seed);
  const result: Dot[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push({
      x: Math.round(rand() * 1000) / 10,
      y: Math.round(rand() * 1000) / 10,
      size: round1(lerp(2, 4.5, rand())), // 2.0–4.5px
      delay: round1(rand() * 4), // 0–4s
      duration: round1(lerp(6, 12, rand())), // 6–12s
      opacity: round2(lerp(0.12, 0.26, rand())), // 0.12–0.26
    });
  }
  return result;
}
