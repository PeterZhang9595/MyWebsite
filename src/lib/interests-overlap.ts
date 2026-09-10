/**
 * Interests 卡片重叠几何计算。
 *
 * 主页右侧卡组采用「每张卡左侧 25% 被前一张遮盖」的叠压布局，
 * hover 时前方的卡片左推让位，使被遮住的标题完整露出。
 *
 * 把几何量抽成纯函数，便于单测锁定比例；
 * 实际渲染由 CSS 的 `--card-w` 与负 margin 实现（见 src/styles/interests.css）。
 */

/** 相邻卡片的重叠比例：前一张压住后一张左侧的 25%。 */
export const OVERLAP_RATIO = 0.25;

/** 卡片宽度的下限（px）。 */
export const CARD_MIN_WIDTH = 210;

/** 卡片宽度的上限（px）。 */
export const CARD_MAX_WIDTH = 273;

/** 卡片宽度相对视口的占比（vw / 100）。 */
export const CARD_VIEWPORT_RATIO = 0.238;

/**
 * 右侧卡片的期望宽度。
 * 与 CSS `clamp(210px, 23.8vw, 273px)` 保持同一条公式，
 * 保证「遮盖 25%」在任何视口下都精确成立。
 *
 * 数值为 2026-09-10 的 ×1.4 放大结果（原 150 / 17vw / 195）。
 */
export function railCardWidth(viewportWidth: number): number {
  if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) return CARD_MIN_WIDTH;
  const fluid = viewportWidth * CARD_VIEWPORT_RATIO;
  return Math.min(CARD_MAX_WIDTH, Math.max(CARD_MIN_WIDTH, fluid));
}

/**
 * 相邻卡片的重叠量（px）：即后一张卡片左移的距离，
 * 同时也是 hover 时前方卡片左推的让位距离。
 *
 * 非法输入返回 0 —— 宁可完全不叠，也不要产出 NaN 让整条轨道布局崩掉。
 */
export function overlapShift(cardWidth: number): number {
  if (!Number.isFinite(cardWidth) || cardWidth <= 0) return 0;
  return cardWidth * OVERLAP_RATIO;
}
