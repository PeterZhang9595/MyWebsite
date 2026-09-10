# 2026-09-10 Interests 兴趣页增强二期设计

> 文档性质：**设计文档**（design spec）。本文档用于对齐方案。用户已在会话中逐条确认决策并指示「进行设计开发」，据此进入实现。
>
> 对应需求：[`docs/requirements/2026-09-10-interests-enhancement2.md`](../requirements/2026-09-10-interests-enhancement2.md)
> 前置设计：[`docs/design/2026-09-10-interests-card-wall.md`](./2026-09-10-interests-card-wall.md)（一期，已实现）
> 前置调研：[`docs/design/2026-09-09-interests-card-references.md`](./2026-09-09-interests-card-references.md)（参考源与许可边界）
> 实施路线图：[`docs/implement-roadmap/2026-09-10-interests-enhancement2.md`](../implement-roadmap/2026-09-10-interests-enhancement2.md)

---

## 1. 目标与范围

一期已把兴趣页做成卡牌两级结构。二期针对「阅读体验」和「主页视觉密度」做五处改造：

| 需求编号 | 改造点 | 涉及层 |
|---|---|---|
| 需求 1 | 浮层背面改为可上下滚动的长文小页面；放大态保持原始宽高比 | 浮层（跨页共用） |
| 需求 2 | 主页删除轨道区标题；左右分区拉开距离；右侧卡片改 1:1 且相互遮盖 25%，标题露出 | 主页 |
| 需求 3 | 子页彩虹渐变铺满整页；面包屑去黄底并删除边框 | 子页 + 页面骨架 |
| 需求 4 | 子页改用 justified 算法排布图片，保持宽高比；去时间；支持无限量图片 | 子页 |
| 需求 5 | 设计初稿可视化 | 交付方式（已完成） |

### 1.1 本轮已确认决策（用户逐条答复）

| # | 决策点 | 选定 |
|---|---|---|
| 1 | 需求 2「最上面那个黑色标题」指哪一个 | **轨道区标题**（`乱七八糟的各种东西`），且**不能与下方卡片重复** |
| 2 | `subtitle`（当前承载 `2026.08`）去留 | **保留字段，改语义为「副标题」**（不再表示时间） |
| 3 | justified 目标行高 | **桌面 260px / 窄屏 180px** |
| 4 | 整页渐变作用范围 | **仅兴趣子页**（主页保持现状） |
| 5 | 主页左右分区 | **中间隔开一定距离**（不再并排紧贴） |
| 6 | 主页右侧卡片比例 | **1:1** |
| 7 | 右卡遮盖方式 | **每张卡右侧 25% 被下一张遮盖**，且**标题必须露出** |
| 8 | 面包屑 | **去黄底之外，边框也一并删除** |
| 9 | justified 测试 | **用不同宽高比的占位图片验证排版**，需支持**无限量图片** |

---

## 2. 需求 1：浮层长文滚动与宽高比保持

### 2.1 现状问题

| 项 | 现状 | 问题 |
|---|---|---|
| 背面容器 | `.interests-overlay__back` 为 `display:flex; justify-content:center`，仅 `overflow-y:auto` | 长文在 80vh 内被压缩视觉重心，且无「小页面」的阅读感；无内边距层次 |
| 正面图片 | `.interests-overlay__front-media img { object-fit: contain }` | **已正确**，需保持并在测试中锁定 |
| 背面内容 | `data-body` 纯文本 `textContent` 注入 | 无法承载图片、公式（KaTeX 已在 `prose.css` 引入） |

### 2.2 设计

**背面改为「可滚动文档小页面」**：

```
┌─ .interests-overlay__back（padding 由内容自持，flex column）─┐
│  ┌─ .interests-overlay__back-scroll（overflow-y:auto）────┐  │
│  │  h2  标题                                              │  │
│  │  p   正文段落（可很长）                                 │  │
│  │  figure / img  插图                                    │  │
│  │  .katex 公式块                                          │  │
│  │  …（内容有多长就滚多长）                                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

关键改动：

1. `.interests-overlay__back` 去掉 `justify-content: center`，改 `display:flex; flex-direction:column; padding:0`，滚动交给内层。
2. 新增 `.interests-overlay__back-scroll { flex:1; min-height:0; overflow-y:auto; padding: clamp(1.5rem,4vw,3.5rem) }`。
   - `min-height: 0` 是 flex 子项可滚动的必要条件。
3. 长文排版复用 `.prose` 的字号与行高（`max-width: 68ch` 居中），支持 `**加粗**`、列表、代码、`$公式$`（KaTeX 已在 `prose.css` 引入，构建期渲染）。
4. 背面内容如需富文本，内容层从「纯字符串 `textContent`」升级为「允许 HTML 片段」：
   - 方案：`body` 保持纯文本作为**兜底**；新增可选 `bodyHtml`（仅本站自有内容使用，不走用户输入）。
   - **本轮从简**：`body` 纯文本，但脚本改用 `textContent` 分段渲染（按 `\n\n` 拆段落），保证换行语义；不引入 `innerHTML`。
   - 公式与图片留待内容侧扩展（见 §7 开放项），本轮把**容器能力**（滚动 + 排版）做出来。

**宽高比保持（放大态 + 翻面态）**：

| 状态 | 要求 | 实现 |
|---|---|---|
| 正面放大态 | 与原始比例一致 | `.interests-overlay__front-media img { width:100%; height:100%; object-fit: contain }`（保持） |
| 翻面态 | 图片若出现在背面，同样不裁切 | `.interests-overlay__back-scroll img { max-width:100%; height:auto }` |

> 注意：**翻转动画本身会让 `rotateY(180deg)` 的背面在视觉上镜像回来**，所以背面内的图片不需要额外 `scaleX(-1)`（现有实现已正确处理，二期不动）。

### 2.3 无障碍

- 浮层已具 `role="dialog"` + `aria-modal`；滚动区加 `tabindex="0"` 使其可键盘滚动，并加 `aria-label`。
- 焦点进入浮层后先落在关闭按钮（现状保持）。
- 滚动区不抢键盘焦点环（`overflow-y:auto` 元素聚焦时浏览器默认显示 outline，需显式 `:focus-visible` 样式）。

---

## 3. 需求 2：主页重叠卡组

### 3.1 删除标题

删除 `.interests-rail__header` 内的 `.interests-rail__title`（`乱七八糟的各种东西` / `All sorts of things`）。

**同时必须去掉重复**：该文案当前出现两次 —— ① 分区标题 ② 左引导卡 `interests-rail__lead` 内文字。用户明确「不要和下面卡片重复了」，因此：

- 删除分区标题 `h2`
- 左引导卡保留文字（它是卡组内的一张卡，承担引导语义）

> 无障碍影响：删除 `h2` 后该 section 失去标题。处置：给 `<section class="interests-rail">` 加 `aria-label`（沿用原文案），保证地标仍可被读屏识别，但视觉上不出现标题。

`railHint`（`左右拖动或滚动查看`）保留，移到 section 顶部右对齐。

### 3.2 左右分区拉开距离

`.card-rail__track` 内子项当前是 `display:flex` 连排。改为：

```
.interests-rail__lead { margin-right: clamp(1.5rem, 4vw, 3.5rem); }
```

即引导卡与右侧卡组之间插入一段固定间隔，拖动时这段空白一同滚动（属于同一滚动容器，视觉上「分区」成立）。

> 为何不拆成两个容器：拆开会让引导卡不随轨道滚动、且需要额外处理窄屏堆叠。用 margin 实现「分区感」成本最低，且不破坏现有拖拽逻辑。

### 3.3 右侧卡片：1:1 + 遮盖 25% + 标题露出

**比例**：`.rail-card { aspect-ratio: 1 / 1 }`，宽度沿用 `clamp(150px, 17vw, 195px)`。高度由比例自然决定，删除原 `min-height: 190px`。

**遮盖 25%**：靠左的卡压住靠右的卡，即下一张被上一张盖住**左侧** 25%，用负 margin 实现：

```
.rail-card + .rail-card { margin-left: calc(-1 * var(--overlap) * var(--card-w)); }
```

`--card-w` 与 `width` 使用同一 `clamp()` 表达式，保证「遮盖 25%」在任何视口都精确成立。

**遮盖方向（实现阶段修正）**：本节初稿写的是「下一张压住上一张的右侧」，**方向相反**，按此实现会把标题塞进被盖住的区域（首版实测：「Fixture 随笔」被裁成「ure 随笔」）。

实际行为由 `z-index` 决定：

```
.rail-card { z-index: calc(100 - var(--i, 0)); }   /* 靠左索引小 → 层级高 */
```

因此**每张卡被遮盖的是左侧 25%，可见区是「右侧 75%」**。定位手段：用 `document.elementFromPoint()` 取重叠区中点，确认最上层元素是 index 较小的那张。

**标题露出**：内容必须**避让左侧**被遮盖的 25%（而非靠左居中对齐）：

```
.rail-card__frame,
.rail-card__body { margin-left: calc(var(--card-w) * var(--overlap) + .35rem); }
```

`.35rem` 是呼吸感余量。实现后逐卡断言 `title.right <= next.left`，全部成立。

同时卡片内布局：

```
┌ ─ ─ ┬───────────────────┐
│     │  ● 首字标记        │
│ 被  │                   │
│ 前  │ 标题              │
│ 一  │ 副标题/计数        │
│ 张  │                   │
└ 盖 ┴───────────────────┘
```

**悬浮突出（参考 CSS-Tricks）**：

| 状态 | 变换 |
|---|---|
| 默认 | 无 |
| hover 自身 | `translateY(-10px)` + `z-index` 提升 + 阴影 |
| hover 时**其后的卡** | 整体右推让位（`translateX(遮盖量)`），使标题完全露出 |
| hover 时**其前的卡** | 不动 |

> CSS-Tricks 原实现用 `.mini-card:hover ~ .mini-card { transform: translateX(130px) }`（兄弟选择器向右推）。本设计沿用同一机制，只是让位距离取「被遮盖宽度」。这样悬浮时被压住的 25% 让出，卡片完整可见。

**z-index 顺序**：为保证「左压右」，`z-index` 需随索引**递减**（左卡更高）。用内联 `style="--i: {index}"` + `z-index: calc(100 - var(--i))` 实现，避免为每张卡写死 z-index。

**导出函数**：为可单测，把「遮盖量 / 让位量」计算抽到 `src/lib/interests-overlap.ts`：

```ts
export const OVERLAP_RATIO = 0.25;
export function railCardWidth(viewportWidth: number): number  // 复刻 clamp(150px,17vw,195px)
export function overlapShift(cardWidth: number): number       // = cardWidth * 0.25
```

### 3.4 JS 影响

`initRails()` 的拖拽逻辑**无需改动**（仍从非 `a` 元素按下才启动）。但由于卡片现在相互遮盖，`pointerdown` 落在被遮盖区域时 `event.target` 是**上层卡**，符合直觉，无需特殊处理。

---

## 4. 需求 3：整页渐变 + 面包屑去黄去边框

### 4.1 整页渐变

**现状**：`.interests-gradient` 是 `.interests-category`（圆角内容块）内的绝对定位层，视觉上渐变只在「中间圆角区」。

**改后**：渐变作为**页面级背景**，铺满整个视口高度。落点选择：

| 备选 | 评价 |
|---|---|
| 给 `html` / `body` 加 | ❌ 会影响全站，需求明确只要兴趣子页 |
| 给 `.site-shell` 加 | ❌ `.site-shell` 是全站共享容器 |
| **给 `.interests-category` 加 `::before` 并突破容器** | ✅ 局部、可控 |

**选定方案**：保留 `interests-category` 作为作用域锚点，但把渐变层改为**固定视口铺满**：

```css
.interests-category::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: <糖果粉紫多层 radial + linear>;
}
```

用 `position: fixed` 而非 `absolute`，好处：

1. 渐变永远铺满视口，长页面滚动时不会在中途露出白底。
2. 无需给 `html/body` 加类，天然只作用于本页（该元素只存在于子页 DOM 中）。

**层叠顺序需核对**：`global.css` 里 `.site-shell { position: relative; z-index: 1 }`，若渐变层在 `.interests-category` 内且 `z-index: 0`，会被 `.site-shell` 的 `z-index:1` 盖住。

> **关键改动**：渐变层必须跳出 `.site-shell` 的层叠上下文，或置于其下。
> 方案：改用 `position: fixed; z-index: -1`，并移除 `.interests-category` 的 `overflow: hidden`（否则 `fixed` 子元素在部分浏览器被裁切）。
> 验证方式：E2E 断言渐变层 `getBoundingClientRect()` 高度 ≥ 视口高度。

同时删除 `.interests-category` 的圆角与内边距，使其成为纯语义容器：

```css
.interests-category { position: relative; min-height: 60vh; padding: 0; border-radius: 0; overflow: visible; }
```

### 4.2 面包屑去黄 + 去边框

现状（`global.css`）：

```css
.terminal-path__line {
  padding: .22rem .48rem;
  background: var(--terminal-highlight);   /* #fff9df 黄底 */
  border-radius: .22rem;
}
```

`--terminal-highlight` 在 `tokens.css` 定义（浅 `#fff9df` / 深 `#302c22`）。

**改后（仅兴趣子页）**：

```css
.interests-category .terminal-path__line {
  background: none;
  border: 0;
  border-radius: 0;
  padding: 0;
}
```

> **注意**：`.terminal-path` 本身有 `border-left: 3px solid var(--heading)`（左侧竖线），这是全站面包屑的识别特征，**用户未要求删除**，保留。
> 用户说的「边框」指 `.terminal-path__line` 的底色块边界；当前该元素**没有 border**，所以「删除边框」的实际含义是：把黄底块连同其圆角边界一起取消，变成一个纯文本行。实现上 `background/border/border-radius/padding` 全清即可。

**作用域**：需确认 `TerminalPath` 的 DOM 在 `.interests-category` **之外**——`ContentLayout` 里 `<TerminalPath>` 与 `<slot />` 是兄弟节点，slot 内容在 `<main>` 内但不在 `.interests-category` 内。

> ⚠️ **这是本设计最容易踩的坑**。`TerminalPath` 由 `ContentLayout` 渲染，无法被 `.interests-category` 选中。
> **修正方案**：给 `ContentLayout` 增加可选 prop `plainPath?: boolean`，为 true 时在 `<main>` 上加 `data-plain-path` 标记；CSS 用 `main[data-plain-path] .terminal-path__line { … }` 选择。语义干净，且不污染其他页面。
> 该改动属**共享组件扩展**，需在批准范围内一并授权。

---

## 5. 需求 4：justified 图片墙

### 5.1 算法（`src/lib/justified.ts`，纯函数可单测）

```
输入：items[{ ratio }], containerWidth, gap, targetHeight
输出：rows[{ items[], height, y }]

目标行高 H = (containerWidth - gap * (n - 1)) / Σ(ratio_i)
逐张累加，当按 H 计算的总宽 ≥ containerWidth 时定行：
  H_row = (containerWidth - gap * (n - 1)) / Σ(ratio of row)
```

**末行策略**：末行若强行铺满，行高会偏离目标。策略：

```
stretch = H_last / targetHeight
if (stretch > TOL) 保持 targetHeight（不拉伸，左对齐留白）
else 采用 H_last（铺满）
```

`TOL = 1.45`（一期可视化初稿中验证过的阈值）。

**「无限量图片」保证**：

- 算法复杂度 O(n) 单遍扫描，无递归无回溯，内存与图片数线性。
- 每行独立计算，不依赖总行数。
- 长页面滚动由浏览器原生负责，不引入虚拟列表（静态站无性能压力）。

### 5.2 宽高比来源（本设计的关键分歧点）

justified 算法**必须知道每张图的真实宽高比**。两种来源：

| 来源 | 优点 | 缺点 |
|---|---|---|
| 构建期从图片文件读取（`image()` 的 `width`/`height`） | 精确、无需 JS 测量 | 无图卡片没有尺寸 |
| 运行时 JS 测量（`naturalWidth/naturalHeight`） | 兼容一切情况 | 需等图片加载，会闪动（CLS） |

**选定：构建期优先 + 运行时兜底**

1. 有 `image` 的卡片：`ImageMetadata.width / height` 在构建期可得 → SSR 直接算出布局，**零 CLS**。
2. 无 `image` 的卡片：无真实尺寸。**本轮fixture 与测试用固定比例的占位图**（见 §5.4），生产内容若缺图则按 `4 / 3` 假比例参与计算，并渲染 CSS 占位块（尺寸与假比例一致，视觉不出错）。

> 这样 justified 是**纯 SSR 静态布局**，不需要运行时 JS 重排 —— 与一期「零依赖、构建期渲染」的架构一致。

### 5.3 卡片结构变化

一期卡牌墙是「等高网格 + 宝可梦粗框」。justified 要求**图片按原始比例**排布，与「统一比例卡框」天然冲突。

**结论：放弃粗框卡牌，改为「图片 + 图注」的墙式排布**（这也是用户需求 4 的原文：「以图片的形式进行展示」）。

```
┌──────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────┐ ┌──────────────┐    │
│ │  image   │ │ image  │ │    image     │    │  ← 每行等高，宽度按比例
│ └──────────┘ └────────┘ └──────────────┘    │
│  标题          标题         标题              │  ← 图注（无时间）
│                                              │
│ ┌────┐ ┌───────────────┐ ┌────────┐         │
│ │img │ │     image     │ │  img   │         │
│ └────┘ └───────────────┘ └────────┘         │
└──────────────────────────────────────────────┘
```

**帧色的去向**：一期 `--frame` 驱动彩框。二期无卡框，帧色转为：
- 图注左侧的 3px 色条（`border-left: 3px solid var(--frame)`）
- 缺图占位块的底色

保证类别内的色彩节奏不丢失。

**hover 行为调整**：一期「其余卡灰化」在图片墙上仍可用（`filter: grayscale(.55) brightness(.92)`），保留但降低强度，避免大图灰化过重。

**去时间**：`subtitle` 不再渲染到图注（改语义为副标题，见 §6）；内容文件里的 `subtitle: "2026.08"` 需**清空或改写为副标题文案**。

### 5.4 测试用占位图

需求明确要求「使用不同宽高比的占位图片来测试能否正常排版」。做法：

在 `tests/fixtures/assets/` 生成 **6 种比例的占位图**（1:1 / 4:3 / 3:2 / 16:9 / 2:3 / 3:4），用 Python + Pillow 或纯 SVG→PNG 生成小尺寸（如 240px 长边），fixture 内容文件引用它们。

> 若不便生成二进制图片，退路：**用不同尺寸的纯色 PNG**（Pillow 一行即可），宽高比由像素尺寸决定，与画面内容无关。

fixture 的 cards 需覆盖 6 种比例 + **一个无图卡片**（验证兜底比例），保证 E2E 能断言「同一行内图片高度一致、不同行高度可不同、宽度误差 < 阈值」。

---

## 6. 内容模型调整（`src/lib/content-schema.ts`）

```ts
cards: z.array(z.object({
  image: image().optional(),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),   // 语义变更：副标题（不再是时间）
  body: z.string().trim().min(1),
  alt: z.string().trim().optional(),
  frame: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
})).default([]),
```

**无字段增删**，仅语义调整 + 内容文件批量清理 `subtitle: "YYYY.MM"`。

---

## 7. 组件与文件改动清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/lib/justified.ts` | **新增** | justified 算法纯函数（行高、末行策略） |
| `src/lib/interests-overlap.ts` | **新增** | 遮盖/让位量计算（`OVERLAP_RATIO`、`overlapShift`） |
| `src/styles/interests.css` | 改 | 重叠卡组、整页渐变、justified 墙、浮层滚动 |
| `src/components/pages/InterestsHome.astro` | 改 | 删轨道标题、左卡留距、卡片 1:1 + `--i` 索引 |
| `src/components/pages/InterestsCategoryPage.astro` | 改 | justified 墙渲染、去时间、渐变层移动 |
| `src/components/content/FlipCard.astro` | 改 | 支持 justified 尺寸透传（`style` 宽高比变量） |
| `src/layouts/ContentLayout.astro` | 改 | 新增 `plainPath` prop |
| `src/content/interests/{zh,en}/*/_index.md` | 改 | 清理 `subtitle` 时间文案（12 个文件） |
| `public/scripts/interests.js` | 改 | 背面按段落渲染；滚动区可聚焦 |
| `tests/unit/justified.test.ts` | **新增** | 算法单测（多种比例、末行策略、边界） |
| `tests/unit/interests-overlap.test.ts` | **新增** | 遮盖量单测 |
| `tests/e2e/interests.spec.ts` | 改 | 追加二期断言 |
| `tests/fixtures/**` | 改 | 6 种比例占位图 + 无图卡片 |
| `scripts/capture-interests.mjs` | 改 | 追加二期截图 |

---

## 8. 测试计划（按项目测试策略 Level 2 视觉变更）

| 类型 | 断言 |
|---|---|
| 单测 | `justified.ts`：单行铺满、多行换行、末行超阈值不拉伸、末行未超阈值铺满、空数组、单张图、极端比例（10:1） |
| 单测 | `interests-overlap.ts`：`overlapShift(200) === 50`、`OVERLAP_RATIO === 0.25` |
| E2E | 主页：轨道区 `h2` **不存在**；左卡与首张右卡间距 ≥ 阈值；右卡 `aspect-ratio` 计算值 ≈ 1；相邻卡水平重叠 ≈ 25%；hover 卡片时标题完整可见 |
| E2E | 子页：渐变层高度 ≥ 视口高度；面包屑 `background` 为透明且无边框 | 
| E2E | 子页：同一行图片高度差 ≤ 1px；不同比例图片宽度比 ≈ 图片宽高比之比 |
| E2E | 浮层：长文内容超出时滚动区 `scrollHeight > clientHeight` 且可滚动；正面图片 `object-fit === 'contain'` |
| 视觉 | 截图：主页（含 hover 态）/ 子页 justified（6 种比例）/ 浮层长文滚动 / 浅深双主题 |

---

## 9. 许可与依赖红线（沿用）

- ❌ 不新增 npm 依赖、不引入前端框架。
- ❌ 不复制 `pokemon-cards-css`（GPL-3.0）。
- ✅ 重叠卡组机制来自 CSS-Tricks **公开源码的机制学习**（负 margin + 兄弟选择器让位），按 CSS-Tricks 许可允许取用，且**从零重写**、参数按本项目重算。

---

## 10. 开放项

1. **背面富文本能力**：本轮只做「多段落纯文本 + 可滚动」。图片与公式需要内容层支持 markdown/HTML 片段，属独立需求，见 `docs/requirements/2026-09-03-edit-tools-development.md`。
2. ~~**缺图卡片的比例**：暂定 `4/3`。~~ **已关闭**（2026-09-10 实现验证）：`4/3` 兜底值能让无图卡片与同行图片等高，实测第 2 行的无图卡 front 高度 = 158.7px，与同行三张完全一致。
3. **justified 目标行高的响应式档位**：当前两档（260 / 180）。若窄屏仍显拥挤，可在实现时补中间档 —— 仍待用户实机确认。

> 实现阶段修正：§3.3 的遮盖方向初稿写反了（详见该节的「遮盖方向」段），已按实测行为更正。

---

## 11. 三期修订（2026-09-10 当晚，用户审核后追加）

二期交付后用户提出五项修订。其中「层叠方向」一项把二期的决策**完全反转**，因此本节记录的结论**覆盖** §3.3。

### 11.1 五项修订

| # | 修订点 | 二期状态 | 三期结论 |
|---|---|---|---|
| 1 | 右侧卡组尺寸 | `clamp(150px, 17vw, 195px)` | **放大 ×1.4** → `clamp(210px, 23.8vw, 273px)` |
| 2 | 层叠方向 | 左压右（`z-index: calc(100 - i)`） | **反转为右压左**（`z-index: calc(100 + i)`） |
| 3 | 卡片色块 | 色块内含分类首字 | **删掉首字**，只留色块；**标题与计数保留** |
| 4 | 左引导卡文案 | `点开任意一类看看` | **`乱七八糟的东西`**（英：`All sorts of stuff`） |
| 5 | 左引导卡尺寸 | — | **不放大**，维持 `clamp(190px, 22vw, 250px)` |

### 11.2 层叠方向反转的连带影响（本轮的核心）

方向反转**不是只改一个 `z-index` 符号**，它连带影响三处必须同步反转的逻辑。二期初稿正是因为只想到方向、没同步这三处，才连续踩坑：

| 项 | 左压右（二期） | 右压左（三期） |
|---|---|---|
| `z-index` | `calc(100 - var(--i))` | `calc(100 + var(--i))` |
| 每张卡被遮盖的边 | **左**侧 25% | **右**侧 25% |
| 内容避让边 | `margin-left: 遮盖宽 + .35rem` | **`margin-right: 遮盖宽 + .35rem`** |
| hover 让位对象 | 其**后**的卡（`~` 右推） | 仍为其**后**的卡（`~` 右推） |

**hover 让位方向为何不变**：让位的目的始终是「把遮盖当前卡的那部分挪开」。右压左时，遮盖当前卡的是**它后面**的卡，因此仍要用 `.rail-card:hover ~ .rail-card` 把后面的卡右推。二期实现阶段曾把它改成 `:has()` 去推前面的卡，方向错了，本轮已改回。

**色块贴左上角的前提**：三期要求色块位于卡片**左上角**。这隐含要求「左侧不留避让边距」，即只有「被遮盖的边在右侧」时才能同时满足。因此 `margin-right` 方案与色块左上角是**互相印证**的 —— 若发现色块被迫内缩，就说明避让边写错了。左内边距单独给 `.85rem` 呼吸感：

```css
.rail-card__frame,
.rail-card__body {
  margin-right: calc(var(--card-w) * var(--overlap) + .35rem);
  margin-left: .85rem;
}
```

### 11.3 定位方法（可复用）

层叠方向无法靠读 CSS 确认（`z-index` 是计算值），必须实测。两个互补手段：

1. **`elementFromPoint` 取重叠区中点**，确认最上层是索引更大（更靠右）的那张。
   - ⚠️ 该 API **只认视口内坐标**。轨道在首屏之下，必须先 `scrollIntoViewIfNeeded()`，否则返回 `-1`。
2. **分别量「卡左内缩」与「后一张卡左边界」**：
   - 色块左内缩应 ≈ 呼吸感量级（实测 14.6px），**不应** ≈ 遮盖宽（68.3px）。
   - 标题文字右边界应 ≤ 后一张卡左边界（`textFits: true`）。

三期排查时正是靠第 2 条发现「色块内缩 74.8px」= 遮盖宽 68.3px + 呼吸感，从而定位到避让边写反。

### 11.4 三期测试变更

`tests/unit/interests-overlap.test.ts`：卡宽档位断言改为 210 / 273，`railCardWidth(1200) === 273`（23.8vw × 1200 = 285.6 超上限）、`railCardWidth(1000) === 238`。

`tests/e2e/interests.spec.ts`（二期 · 主页重叠卡组 分组）：
- 新增「卡片色块贴左上角」：断言色块内缩 < 卡宽 9%（区分呼吸感 vs 遮盖宽）。
- 新增「标题完整落在可见区内」：逐卡断言 `title.right <= next.left`，**这是唯一能捕获「避让边写反」的断言**（文本非空断言无法捕获视觉裁切）。
- 改「悬浮让位」为「后方卡片右推」：`secondAfter.x > secondBefore.x + 10`。
- 删「左引导卡左推让位」旧用例（方向已废）。

### 11.5 其余落地

- 左引导卡文案：`src/components/pages/InterestsHome.astro` 的 `leadText`。
- 色块：`<span class="rail-card__frame" aria-hidden="true"></span>`，移除 `{title.slice(0,1)}`。
- 窄屏卡宽同步 ×1.4：`clamp(130px, 34vw, 170px)` → `clamp(182px, 47.6vw, 238px)`。


