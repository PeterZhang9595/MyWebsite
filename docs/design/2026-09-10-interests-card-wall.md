# 2026-09-10 Interests 兴趣页卡牌化设计

> 文档性质：**设计文档**（design spec）。本文档用于对齐方案，**不构成实现授权**。
> 用户在本文档上明确「批准实现」后，方可改动 `src/`。
>
> **状态（2026-09-10）**：已获用户批准并**实现完成**。实施记录见
> [`docs/records/2026-09-10-interests-card-wall.md`](../records/2026-09-10-interests-card-wall.md)。
> 实现中相对本设计的偏差（`HeroPair` 未独立成组件、三段式交互落在独立脚本、追加可选 `alt` 字段）已在记录文档中列明。

对应需求：[`docs/requirements/2026-09-09-interests-enhancement.md`](../requirements/2026-09-09-interests-enhancement.md)
前置调研：[`docs/design/2026-09-09-interests-card-references.md`](./2026-09-09-interests-card-references.md)（参考源与许可边界）

---

## 1. 目标与范围

把兴趣页从「单页正文」改造为**卡牌化的两级结构**：

- **一级 `/interests/`**：全宽主页。上半两张可点击大图（放大 → 翻面），下半为「CSS-Tricks 风格」横滑卡片轨道。
- **二级 `/interests/<类别>/`**：兴趣子页。糖果粉紫渐变背景 + 竖版彩色卡牌墙（点击放大 → 翻面）。
- **中英双语**：所有文案与内容均需 zh / en 两份，路由沿用 `/en/` 前缀约定。

### 1.1 本次已确认的决策（用户逐项选定）

| # | 决策点 | 选定 |
|---|---|---|
| 1 | 卡牌版式 | **方案 A · 经典宝可梦框**（彩色粗框 + 浅色卡面 + 照片居中带内边距 + 下方信息带） |
| 2 | 子页背景 | **③ 糖果粉紫**（粉 → 紫 → 蓝多层 radial mesh，纯 CSS） |
| 3 | 卡牌比例 | **宽 : 高 = 3 : 4**（竖版） |
| 4 | 双语 | **是**，zh / en 各一份 |
| 5 | 主页双图 | 等宽平分（各 50%） |
| 6 | 主页滑轨 | 中高卡，一屏约 4 张；交互 = 拖拽 + 滚轮横向滚 |
| 7 | 子页路由 | 支持多级子页（需新增 catch-all 路由） |
| 8 | 主页两张图 | 先用占位搭原型，位置留好 |

---

## 2. 现状与差距

### 2.1 现状（已核实）

| 项 | 现状 |
|---|---|
| 路由 | 仅 `src/pages/interests/index.astro` + `src/pages/en/interests/index.astro`，**无 catch-all** |
| 组件 | `src/components/pages/InterestsPage.astro`，走 `ContentLayout`（窄版 760px） |
| 内容 | `src/content/interests/{zh,en}/_placeholder.md` 两个占位 |
| Schema | `createInterestsSchema`：= 公共 schema + `order?: number`。**无 `cover` 之外的多图字段、无分类字段** |
| 模型认知 | `slug` 决定层级；每级目录需 `_index.md`；`SectionIndexPage` 要求 `slug === section` 且 `isDirectory` |

### 2.2 差距

1. **无多级路由** → 需新增 `[...slug]` catch-all（参照 `src/pages/projects/[...slug].astro`）。
2. **无卡片字段** → `Interests` schema 需扩展（卡片列表、帧色、背面文字、卡片图片）。
3. **无全宽版式** → 现有 `ContentLayout` 是窄版；主页需 wide/满宽布局（`ContentLayout` 已有 `wide` prop，可复用）。
4. **无卡牌组件** → 全部新建。
5. **无主页双图机制** → 需新增「点击放大 → 翻面 → 复原」交互。

---

## 3. 内容模型设计

### 3.1 Schema 扩展（`src/lib/content-schema.ts`）

```ts
export function createInterestsSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    order: z.number().int().optional(),
    // 一级主页：两张可点击大图
    heroImages: z.array(z.object({
      image: image(),
      title: z.string().trim().min(1),
      body: z.string().trim().min(1),
    })).max(2).default([]),
    // 二级子页：卡牌墙
    cards: z.array(z.object({
      image: image(),
      title: z.string().trim().min(1),
      subtitle: z.string().trim().optional(),
      body: z.string().trim().min(1),
      frame: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
    })).default([]),
  });
}
```

**设计说明**：

- `heroImages` 与 `cards` 均为**可选数组**，缺省为空 → 现有占位内容与测试 fixture 不受影响（向后兼容）。
- `frame` 为 6 位 hex；缺省时由组件按索引从调色板循环取色（见 §5.3）。
- `image()` 走 Astro 图片优化；文件放 `src/assets/interests/`。

### 3.2 内容文件布局（最终形态）

```
src/content/interests/zh/
├── _index.md                  # slug: interests（一级主页，含 heroImages）
├── sports/
│   ├── _index.md              # slug: interests/sports（二级子页，含 cards）
│   ├── morning-run.md         # （可选）单独卡片也可独立成文
│   └── ...
├── essay/_index.md
├── music/_index.md
├── film/_index.md
├── reading/_index.md
└── medicine-life/_index.md

src/content/interests/en/       # 同构（slug 需为英文稳定片段）
```

> ⚠️ **层级由 `slug` 决定，不是文件夹结构**（项目既有约定）。文件夹仅为组织便利，须与 slug 保持一致。
> ⚠️ 每一级目录都要有 `_index.md`，否则该层 URL 404、面包屑死链。

### 3.3 六个兴趣类别（用户指定）

| 中文 | 英文 slug | 帧色（示例） |
|---|---|---|
| 运动 | `sports` | `#D4537E` |
| 随笔 | `essay` | `#7F77DD` |
| 音乐 | `music` | `#1D9E75` |
| 影视 | `film` | `#BA7517` |
| 阅读 | `reading` | `#378ADD` |
| 生活中的医学 | `medicine-life` | `#E24B4A` |

---

## 4. 路由与页面结构

### 4.1 要改/新增的文件

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/pages/interests/index.astro` | 改 | 改为渲染 `InterestsHome`（主页组件） |
| `src/pages/en/interests/index.astro` | 改 | 同上（en） |
| `src/pages/interests/[...slug].astro` | **新增** | 二级子页 catch-all |
| `src/pages/en/interests/[...slug].astro` | **新增** | 同上（en） |
| `src/components/pages/InterestsHome.astro` | **新增** | 主页：双图 + 滑轨 |
| `src/components/pages/InterestsCategoryPage.astro` | **新增** | 子页：渐变背景 + 卡牌墙 |
| `src/components/content/FlipCard.astro` | **新增** | 通用翻面卡牌（放大 + 翻面三段式） |
| `src/components/content/CardRail.astro` | **新增** | 主页横滑轨道（拖拽 + 滚轮） |
| `src/components/content/HeroPair.astro` | **新增** | 主页双图（等宽平分） |
| `src/lib/interests-frames.ts` | **新增** | 帧色调色板与取值函数（可单测） |
| `src/styles/interests.css` | **新增** | 本板块专用样式（渐变、卡牌、轨道） |
| `src/lib/content-schema.ts` | 改 | 扩展 interests schema（§3.1） |
| `tests/unit/interests-frames.test.ts` | **新增** | 帧色取值单测 |
| `tests/e2e/interests.spec.ts` | **新增** | 主页 + 子页 E2E |

### 4.2 catch-all 路由实现（参照 projects 模式）

```astro
---
import InterestsCategoryPage from '../../components/pages/InterestsCategoryPage.astro';
import { loadPublicContent } from '../../lib/content-repository';
export async function getStaticPaths() {
  return (await loadPublicContent('interests', 'zh'))
    .filter((item) => item.data.slug !== 'interests')
    .map((item) => ({
      params: { slug: item.data.slug.slice('interests/'.length) },
      props: { item },
    }));
}
const { item } = Astro.props;
---
<InterestsCategoryPage lang="zh" {item} />
```

> 与 `src/pages/projects/[...slug].astro` 同构，保证行为一致。
> **注意**：`getStaticPaths` 只对**叶子级** `_index.md`（即六个类别）产出页面；卡片本身是数组字段，不单独成路由。

---

## 5. 视觉设计规范

### 5.1 主页（`/interests/`）

**布局**：满宽（bleed 到视口边缘），不复用窄版 `content-page`。

```
┌─────────────────────────────────────────────┐
│  兴趣 / Interests                            │  ← 页面标题区
├──────────────────────┬──────────────────────┤
│                      │                      │
│    Hero 图 A         │    Hero 图 B         │  ← 等宽平分，16:9
│  （点击 → 放大 → 翻面）│  （点击 → 放大 → 翻面）│
│                      │                      │
├──────────────────────┴──────────────────────┤
│  乱七八糟的各种东西                           │  ← 分区标题
│ ┌────────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐     │
│ │ 固定   │ │运动│ │随笔│ │音乐│ │影视│ ...  │  ← 左侧固定卡 + 右侧横滑轨道
│ │ 大卡   │ └────┘ └────┘ └────┘ └────┘     │     一屏约 4 张
│ └────────┘                                   │
└─────────────────────────────────────────────┘
```

**Hero 双图交互（三段式）**：

1. 点击 → 放大到容器 **80%（宽高）**，居中，背景加深
2. 再点击 → `rotateY(180deg)` 翻面显示介绍文字
3. 再点击 → 复原（缩回原位）
4. `Esc` 亦可还原

**滑轨**：拖拽 + 滚轮横向滚（`overflow-x: auto` + pointer 拖拽），无按钮、无依赖。

### 5.2 子页卡牌（方案 A · 经典宝可梦框）

```
┌─ 3px 彩色边框（--frame） ────────────┐
│  ┌──────────────────────────────┐  │
│  │                              │  │
│  │         照片（4:3 区域内嵌）    │  │
│  │                              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ 周日晨跑                       │  │  ← 信息带（浅白底）
│  │ 2026.08 · 运动                 │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
        整卡宽:高 = 3:4
```

**卡牌交互**（与 Hero 同构）：

- 点击 → 放大到视口 80%
- 再点 → 翻面显示正面文案（`body`）
- 再点 → 复原

**聚焦导视**（来自参考 R5）：hover 卡片时，**其余卡** `grayscale(.6) brightness(.88)`，当前卡保持全彩并 `translateY(-4px) scale(1.02)`。

### 5.3 帧色派生（`--frame` 单变量驱动）

```css
.pcard {
  --frame: #D4537E;                                   /* 每卡一个 */
  border: 3px solid var(--frame);
  background: color-mix(in srgb, var(--frame) 10%, white);   /* 浅卡面 */
}
.pcard__back {
  background: color-mix(in srgb, var(--frame) 55%, black);   /* 背面深色 */
  color: #fff;
}
```

**调色板**：`src/lib/interests-frames.ts` 导出 `FRAME_PALETTE`（6 色，见 §3.3）与 `frameFor(index)`（越界循环取色）。卡片未指定 `frame` 时按索引取色，保证同一子页内配色不重复。

### 5.4 背景渐变（方案 ③ · 糖果粉紫 · 纯 CSS 零依赖）

```css
.interests-gradient {
  background:
    radial-gradient(100% 120% at 0% 0%, #ffb3ba 0%, transparent 55%),
    radial-gradient(90% 100% at 100% 10%, #e0baff 0%, transparent 60%),
    radial-gradient(120% 120% at 50% 100%, #bae1ff 0%, transparent 65%),
    linear-gradient(180deg, #fff0f4 0%, #f3e8ff 100%);
}
```

> 参考源：`frontendgeek.com`（彩虹预设）与 `codioful.com`（mesh 渐变），均声明免费可用于个人/商业项目；**只借鉴渐变思路，不抄整站样式**。
> 深色主题下需另行给一套深底版本（见 §7 开放项）。

### 5.5 无障碍

- 卡牌可键盘聚焦（`tabindex`），`Enter` / `Space` 触发放大/翻面。
- `prefers-reduced-motion: reduce`：关闭倾斜、视差、浮动、放大过渡动画；**保留翻面**（属内容切换而非装饰）。
- `pointer: coarse`（触屏）：不做 hover 灰化。
- 放大层加 `role="dialog"` + `aria-modal`，`Esc` 关闭。
- 图片 `alt` 使用卡片 `title`（或专用 `alt` 字段，见 §7）。

---

## 6. 测试计划（按测试策略 Level 2 视觉变更）

| 类型 | 内容 |
|---|---|
| 单测 | `interests-frames.test.ts`：调色板长度、`frameFor` 越界循环、hex 格式合法性 |
| E2E | 主页：双图存在且可点击 → 放大态可见 → 翻面态可见 → 复原；滑轨可横向滚动；六张类别卡可点入 |
| E2E | 子页：卡牌数量、帧色生效、hover 灰化、点击放大/翻面/复原、`Esc` 关闭 |
| E2E | 双语：`/interests/` 与 `/en/interests/` 均可访问，标题语言正确 |
| 视觉 | 截图存 `tests/artifacts/2026-09-10-interests/`：主页（zh/en）+ 子页（zh/en）+ 暗色主题 |

> fixture 需同步新增 `tests/fixtures/content/interests/{zh,en}/` 下的类别与卡片，供 E2E 稳定断言。

---

## 7. 已定与开放项

### 7.1 已定（本轮补充确认）

| 项 | 决定 |
|---|---|
| 暗色主题渐变 | **做深底版**：深紫底（`#2a1a2e → #1b1a19`）叠粉紫光斑，与浅色糖果粉紫对位 |
| 每类占位卡数 | **6 张**（一屏约 4 张时刚好可滚动） |
| 图片目录 | **`src/assets/interests/`**，走 Astro 自动优化（WebP + srcset） |

### 7.2 暗色渐变方案（方案 ③-dark）

```css
:root[data-theme='dark'] .interests-gradient {
  background:
    radial-gradient(100% 120% at 0% 0%, #ff6ec7 0%, transparent 45%),
    radial-gradient(90% 100% at 100% 10%, #8338ec 0%, transparent 50%),
    radial-gradient(120% 120% at 50% 100%, #3a0050 0%, transparent 60%),
    linear-gradient(180deg, #2a1a2e 0%, #1b1a19 100%);
}
```

### 7.3 图片路径约定

```
src/assets/interests/
├── hero-a.jpg        # 主页 Hero 图 A
├── hero-b.jpg        # 主页 Hero 图 B
├── sports/           # 每个类别一个子目录
│   ├── 01.jpg
│   └── ...
├── essay/
├── music/
├── film/
├── reading/
└── medicine-life/
```

在 frontmatter 中引用：`image: ../../assets/interests/sports/01.jpg`（相对内容文件）。

### 7.4 仍待定（不阻塞开工）

1. ~~**卡片 `alt` 文案**：复用 `title` 还是单独字段？~~ → **已定**：schema 增加**可选 `alt`** 字段，未填时回退 `title`（2026-09-10 实现时采纳）
2. **主页 Hero 图尺寸**：默认 16:9（用户后续补图时若比例不同需说明）

---

## 8. 许可与依赖红线（沿用前置调研结论）

- ❌ 不引入 `pokemon-cards-css`（GPL-3.0 + Svelte）。
- ❌ 不引入 Vue / React / Svelte / Tailwind / Canvas。
- ❌ 不新增 npm 依赖。
- ✅ 仅借鉴 CSS-Tricks（信息层级）、R4/R5/R6（通用机制），**全部从零重写**。
- ✅ 渐变思路借鉴 frontendgeek / codioful，不抄整站样式。

---

## 9. 交付与流程

本设计文档覆盖一级主页 + 二级子页 + 卡牌组件 + 内容模型 + 路由改动。按项目规矩：

1. 用户逐项审阅本文档 → 明确「**批准实现**」
2. 实现阶段走 TDD，按 §6 测试计划补单测与 E2E
3. 构建后出浅色/深色双主题截图供验收
4. 聊天中确认的决策在任务结束前落入本文档与记录文档

> 特别说明：**新增 `[...slug]` catch-all 路由属代码改动**（会改变 interests 的 URL 结构），已在本设计中显式列出，需在批准范围内一并授权。
