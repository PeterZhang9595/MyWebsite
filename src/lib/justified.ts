/**
 * Justified 图片墙布局算法。
 *
 * 目标：在**不改变图片宽高比**的前提下把图片铺满容器宽度。
 * 经典 justified gallery 做法：
 *   1. 以目标行高为起点，逐张累加；
 *   2. 当某一行按当前行高算出的总宽 ≥ 容器宽时，这一行定稿，
 *      行高由「容器宽 − 间距」反解得出，因此该行恰好铺满；
 *   3. 末行单独处理 —— 强行铺满会让行高远偏离目标（出现一张巨图），
 *      因此当拉伸比超过阈值时保持目标行高，宁可右侧留白。
 *
 * 算法为单遍线性扫描，无回溯、无递归，
 * 因此图片数量增长只影响行数，不影响单行计算成本（支持无限量图片）。
 *
 * 本模块是纯函数，不依赖 DOM；构建期（SSR）即可算出全部布局，
 * 因此页面加载后不会发生重排（零 CLS）。
 */

/** 未显式指定目标行高时的默认值（px，桌面档）。 */
export const DEFAULT_TARGET_HEIGHT = 260;

/** 窄屏档目标行高（px）。 */
export const NARROW_TARGET_HEIGHT = 180;

/**
 * 末行拉伸容忍度。
 * 末行若强行铺满，其行高与目标行高之比超过该值时放弃拉伸。
 * 1.45 意味着一行最多比目标高 45%，再多就显得突兀。
 */
export const LAST_ROW_TOLERANCE = 1.45;

/** 无法取得真实宽高比时的兜底比例（4:3 横图）。 */
export const FALLBACK_RATIO = 4 / 3;

/** 合法的宽高比下限/上限，防止极端值把行撑坏或压扁。 */
const MIN_RATIO = 0.05;
const MAX_RATIO = 20;

export interface JustifiedInput {
  /** 宽高比 = 宽 / 高。 */
  ratio: number;
}

export interface JustifiedItem<Meta = unknown> {
  /** 输入数组中的原始下标，便于调用方回填业务数据。 */
  index: number;
  /** 归一化后的宽高比（非法值已按兜底处理）。 */
  ratio: number;
  /** 该图在本行中的渲染宽度（px）。 */
  width: number;
  /** 该图在本行中的渲染高度（px），与本行 height 相同。 */
  height: number;
  /** 调用方附加的原始数据。 */
  meta: Meta | undefined;
}

export interface JustifiedRow<Meta = unknown> {
  items: Array<JustifiedItem<Meta>>;
  /** 本行行高（px），行内所有图片高度一致。 */
  height: number;
  /** 本行是否铺满容器宽（末行可能不铺满）。 */
  stretched: boolean;
}

/**
 * 把一个宽高比归一化到可用区间。
 * 0 / 负数 / NaN / Infinity 一律回退到 4:3，避免产出 NaN 宽度。
 */
function normalizeRatio(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return FALLBACK_RATIO;
  if (ratio < MIN_RATIO) return MIN_RATIO;
  if (ratio > MAX_RATIO) return MAX_RATIO;
  return ratio;
}

/**
 * 计算一行的行高：由容器宽、间距与行内比例之和反解，使该行恰好铺满。
 */
function rowHeightFor(sumRatio: number, count: number, containerWidth: number, gap: number): number {
  const available = containerWidth - gap * Math.max(0, count - 1);
  if (sumRatio <= 0 || available <= 0) return 0;
  return available / sumRatio;
}

/**
 * 对一个「以比例描述」的图片序列做 justified 排布。
 *
 * @param ratios 每张图的宽高比（宽 / 高），按展示顺序给出
 * @param containerWidth 容器可用宽度（px）
 * @param gap 行内相邻图片的水平间距（px），也是行与行之间的垂直间距
 * @param targetHeight 目标行高（px），缺省用 DEFAULT_TARGET_HEIGHT
 */
export function justify<Meta = unknown>(
  ratios: ReadonlyArray<number | JustifiedInput> | ReadonlyArray<Meta & JustifiedInput>,
  containerWidth: number,
  gap: number,
  targetHeight: number = DEFAULT_TARGET_HEIGHT,
): Array<JustifiedRow<Meta>> {
  const normalized = ratios.map((entry) => {
    if (typeof entry === 'number') return { ratio: normalizeRatio(entry), meta: undefined as Meta | undefined };
    const record = entry as JustifiedInput & Meta;
    return { ratio: normalizeRatio(record?.ratio), meta: record as Meta };
  });
  if (normalized.length === 0) return [];

  const safeWidth = Number.isFinite(containerWidth) && containerWidth > 0 ? containerWidth : 0;
  const safeGap = Number.isFinite(gap) && gap >= 0 ? gap : 0;
  const safeTarget = Number.isFinite(targetHeight) && targetHeight > 0 ? targetHeight : DEFAULT_TARGET_HEIGHT;

  // 容器宽不足以容纳单张图时（极端窄屏），退化为「每行一张、按目标行高」，
  // 保证算法始终能收敛而不是产生空行或死循环。
  const effectiveWidth = safeWidth <= 0 ? 0 : safeWidth;

  const rows: Array<JustifiedRow<Meta>> = [];
  let current: Array<JustifiedItem<Meta>> = [];
  let sum = 0;

  const flush = (stretched: boolean) => {
    if (current.length === 0) return;
    const natural = rowHeightFor(sum, current.length, effectiveWidth, safeGap);
    let finalHeight: number;
    let isStretched: boolean;
    if (stretched) {
      // 定行的行由「铺满」反解得出，必然铺满
      finalHeight = Number.isFinite(natural) && natural > 0 ? natural : safeTarget;
      isStretched = true;
    } else {
      // 末行：铺满是否可接受，取决于铺满后的行高**偏离目标行高多少**。
      // 偏离用比值衡量（取自然行高与目标行高之比的倒数较大者），
      // 这样「被拉高」与「被压扁」两个方向都能拦住。
      const ratioToTarget = natural > 0 ? natural / safeTarget : Number.POSITIVE_INFINITY;
      const deviation = Math.max(ratioToTarget, ratioToTarget > 0 ? 1 / ratioToTarget : Number.POSITIVE_INFINITY);
      const useStretch = Number.isFinite(natural) && natural > 0 && deviation <= LAST_ROW_TOLERANCE;
      finalHeight = useStretch ? natural : safeTarget;
      isStretched = useStretch;
    }
    rows.push({
      items: current.map((item) => ({ ...item, width: item.ratio * finalHeight, height: finalHeight })),
      height: finalHeight,
      stretched: isStretched,
    });
    current = [];
    sum = 0;
  };

  for (let index = 0; index < normalized.length; index += 1) {
    const { ratio, meta } = normalized[index];
    current.push({ index, ratio, width: 0, height: 0, meta });
    sum += ratio;

    if (effectiveWidth <= 0) {
      // 无有效容器宽：每行一张，避免死循环
      flush(false);
      continue;
    }

    const candidateHeight = rowHeightFor(sum, current.length, effectiveWidth, safeGap);
    // 定行条件：再塞下这一张后，行高已降到目标行高以下（即这一行「装满了」）。
    // 不能用「总宽 >= 容器宽」——那会让第一张图就单独成行（它独占整宽时必然铺满）。
    // 最后一个元素不进此判定：它构成的是末行，须走末行策略。
    if (candidateHeight <= safeTarget && index < normalized.length - 1) {
      flush(true);
    }
  }

  // 收尾：剩余元素即末行，按偏离度决定是否铺满
  flush(false);
  return rows;
}

/**
 * 便捷入口：从图片的像素尺寸得到宽高比。
 * 尺寸缺失时回退 4:3。
 */
export function ratioFromSize(width?: number, height?: number): number {
  if (!Number.isFinite(width) || !Number.isFinite(height) || !width || !height) return FALLBACK_RATIO;
  return normalizeRatio(width / height);
}
