/**
 * Interests 卡牌的帧色调色板。
 *
 * 每张卡只用一个 `--frame` 变量驱动整套配色：
 * 边框、浅色卡面、背面深色都从它派生（见 src/styles/interests.css）。
 * 卡片未在 frontmatter 里指定 `frame` 时，按索引循环取色，
 * 保证同一子页内相邻卡片配色不重复。
 */

/** 六个类别的默认帧色（取自项目调色板的 600 档，深浅主题下均可用）。 */
export const FRAME_PALETTE = [
  '#D4537E', // 粉
  '#7F77DD', // 紫
  '#1D9E75', // 绿
  '#BA7517', // 琥珀
  '#378ADD', // 蓝
  '#E24B4A', // 红
] as const;

/**
 * 取第 index 张卡的帧色，越界自动循环。
 * 非有限数值（NaN / Infinity）回退到首色，避免渲染出无意义的颜色。
 */
export function frameFor(index: number): string {
  if (!Number.isFinite(index)) return FRAME_PALETTE[0];
  const len = FRAME_PALETTE.length;
  const normalized = ((Math.trunc(index) % len) + len) % len;
  return FRAME_PALETTE[normalized];
}
