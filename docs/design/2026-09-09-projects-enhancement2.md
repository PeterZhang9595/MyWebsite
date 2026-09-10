# 2026-09-09 Projects 视觉增强二轮设计

对应需求：[`docs/requirements/2026-09-09-projects-enhancement2.md`](../requirements/2026-09-09-projects-enhancement2.md)

## 1. 目标与范围

在第一轮 Projects 增强（分区卡片墙 + 无限层 + 固定入口）的基础上，做一轮**视觉与信息表达**的迭代，不改变既有数据模型与路由结构：

1. 目录卡片悬停反馈从「边框转紫」改为「整体变灰」；
2. 为 Projects 目录页设计 antfu 风格的**散点背景氛围层**；
3. 用**绿/蓝/红三态动态波纹**表达项目完成状态；技术栈从「纯文字」升级为带图标；
4. 保证五个分类分区可容纳无限子项目（验证既有架构可扩展性）。

**范围内**：卡片组件、详情页组件、技术图标映射、CSS 令牌与样式、测试、占位内容微调、文档。
**范围外**：Notes / Tips / Interests 的版式；项目数据模型（不新增必填字段）；音乐播放器、插画外壳；搜索索引行为。

## 2. 需求逐条映射

| 需求条目 | 实现方式 |
|---|---|
| ① hover 由「边缘变紫」改为「子项目整体变灰 + 字体降饱和」 | 改 `.project-card` 悬停样式：去掉 `border-color: var(--focus)`，改用 `filter: saturate(...)` 或背景/文字降饱和 |
| ② 设计 antfu.me/projects 式**散点式背景** | 在项目目录页加一层低对比散点背景氛围层，散点缓慢浮动（`prefers-reduced-motion` 降级） |
| ③ 详情页绿/蓝/红动态波纹包装完成情况 + 技术栈图标 | 状态三色令牌 + 详情页顶部波纹状态灯 + 目录卡片常显角标；技术栈走 Simple Icons 收录的 SVG path |
| ④ 五个分区容纳无限子项目 | 架构已满足（`projectCategories` 数组 + `groupByCategory` 动态分组），本处仅验证 + 补充说明 |
| ⑤ 每处设计先在聊天可视化 | 已完成 4 幅预览：hover 对比、散点背景、三态波纹、五处改动总览接线图 |

## 3. 已确认决策

| 议题 | 结论 | 理由 |
|---|---|---|
| 需求① hover 的作用对象 | 目录页的**项目卡片**（保持卡片墙形态），不改为博客式文字列表 | 用户澄清 |
| 需求② antfu 参考程度 | **只取「散点作为背景氛围层」这一通用手法**，应用到当前卡片墙首页；不改动卡片墙布局为列表 | 用户澄清；布局已在一轮定型，不宜为借鉴而推翻 |
| 需求③ 波纹-状态映射 | 三态三色：`active`（进行中）→ **蓝**，`completed`（已完成）→ **绿**，`archived`（已归档）→ **红** | 用户澄清；颜色需在两种主题下均有足够对比，见 §6 |
| 需求③ 波纹落点 | **详情页顶部大状态灯 + 目录卡片左上角常显小角标，两者都做** | 用户澄清；卡片角标常显便于扫读状态 |
| 需求③ 技术栈图标来源 | **Simple Icons**：按需把所需技术的官方 SVG path 抄录进 `src/data/tech-icons.ts`（构建期内联，零运行时请求） | 用户澄清；lucide 不含任何品牌/技术图标（已实测 1800 个里无 github/typescript/react/python/git） |
| 需求④ 可扩展性 | 视为**已验证的既有能力**，不在本次新增结构 | 一轮已实现数组驱动动态分组 |

### 3.1 对一轮旧决策的迭代修正

一轮设计文档 §6.2 写明「悬停：边框转 `var(--focus)`（紫）」——这正是本轮需求①要求移除的效果。此为**迭代修正**而非并行冲突：本轮以新需求为准，旧的 hover 紫边在二轮落地后失效。

## 4. 视觉方向

站点现为「衬线正文 + 终端路径 + 克制紫 `#6657c8`」的编辑感底子。本轮三个新增视觉（灰化 hover、散点氛围、三色波纹）都必须**克制地嵌入**这一底子，不喧宾夺主。为避免与「AI 味」三件套（紫渐变、平均分配浅色、无氛围层次）混同，方向定为：

> **散点如尘埃，波纹如呼吸。** 背景散点只在明暗交界与留白处若隐若现，不抢正文；状态波纹仅在详情页顶部与卡片角标以低饱和色出现，颜色承担信息而非装饰。

- 主视觉仍是内容与卡片本身，背景与波纹都是**低对比氛围层**，不是主角。
- 三色仅在状态语义处出现，遵循「单屏最多一个强调色」纪律——目录页角标是多项目状态，允许并列，但每颗点都是低饱和状态色而非高饱和广告色。

## 5. 数据模型

### 5.1 状态令牌（新增 CSS 变量）

不新增内容字段，直接消费既有 `status`（`active` / `completed` / `archived`）。在 `src/styles/tokens.css` 补状态色令牌，需满足深浅两套主题下的对比度：

```css
:root {
  --status-active: #185fa5;      /* active  蓝，正文/图标 ≥4.5:1 或 ≥3:1 用深档 */
  --status-completed: #3b6d11;   /* completed 绿 */
  --status-archived: #a32d2d;    /* archived 红 */
  /* 深色主题用 100~200 档浅色版本 */
}
:root[data-theme='dark'] {
  --status-active: #85b7eb;
  --status-completed: #97c459;
  --status-archived: #f09595;
}
```

供卡片角标、详情状态灯、状态文字共用同一套源。颜色沿用现有调色盘的语义分档（见下表）。

### 5.2 技术栈图标映射（新增 `src/data/tech-icons.ts`）

lucide 不含技术品牌图标，故建一个**字符串键 → SVG path** 的静态映射，收录本项目真实使用的技术。数据来自 Simple Icons（ISC/CC0 兼容，已核验 npm 16.30.0 存在）：

```ts
export interface TechIcon { title: string; path: string; hex: string }
export const techIcons: Record<string, TechIcon> = {
  python: { title: 'Python',   hex: '3776AB', path: '<svg path…>' },
  typescript: { title: 'TypeScript', hex: '3178C6', path: '…' },
  astro: { title: 'Astro', hex: 'BC52EE', path: '…' },
  // 按需追加，未收录的技术回退为通用占位
};
```

- **只收录真实用到的技术**（当前占位：Go / PyTorch / Python / TypeScript / Astro），不整包引入（包 unpacked ~16MB，违反克制依赖）。
- `path` 为 Simple Icons 的 24×24 viewBox 内 path，用 `<svg viewBox="0 0 24 24"><path d="…"/></svg>` 内联渲染。
- 未收录技术：回退为中性圆点 / 首字母，绝不伪造品牌图标。
- 许可与来源标注在文件头部注释：每项注明取自 Simple Icons、ISC 许可、原始品牌名。
- 数据在**构建期内联**为 SVG，无任何运行时外部请求。

## 6. 组件与样式落点

### 6.1 hover 变灰（改 `.project-card`）

去掉 `:hover { border-color: var(--focus) }`，改为整卡降饱和 + 标题文字降饱和，并保留轻微「按下」反馈：

```css
.project-card { transition: filter .18s ease, background-color .18s ease, transform .18s ease; }
.project-card:hover {
  filter: saturate(.35) brightness(.985);       /* 整卡含封面一起灰化 */
  transform: translateY(-1px);
}
.project-card:hover .project-card__title { color: var(--muted); } /* 标题字也变灰 */
.project-card:active { transform: translateY(0); }
```

- 目标语义参考 arthals.ink 博客条目：hover 时条目「沉下去/变灰」，而非亮起来。这里把 arthals 的「列表条目灰化」语义移植到「卡片灰化」。
- `filter: saturate()` 会对已优化的封面图统一降饱和，最接近「整张卡变灰」的直觉；`color` 过渡只影响标题文字。封面用纯 `Image`（非 `<img>`），`filter` 直接作用于 `<a>` 层。
- `prefers-reduced-motion` 下 `filter` 即时切换，无过渡。

### 6.2 散点背景氛围层（ProjectSectionIndex / 目录页）

新增一个无 JS、纯 CSS 的背景层组件或样式，散布 1~3px 圆点并缓慢浮动：

```css
.project-atmosphere {
  position: absolute; inset: 0; pointer-events: none; overflow: hidden;
}
.project-atmosphere .dot {
  position: absolute; border-radius: 50%;
  background: var(--text); opacity: .12;             /* 低对比，弱主题 */
}
@keyframes dot-float { from { transform: translateY(0) } to { transform: translateY(-6px) } }
@media (prefers-reduced-motion: no-preference) { .project-atmosphere .dot { animation: dot-float 7s ease-in-out infinite alternate; } }
@media (prefers-reduced-motion: reduce) { .project-atmosphere .dot { animation: none; } }
```

- **散点分布生成**：构建期在组件里用确定性的伪随机（固定种子）在页面容器内散布固定数量圆点，输出为静态 HTML（不引入运行时 JS、不依赖 Canvas）。实现用 `Math` + 固定种子，或用简单哈希对每点给 x/y/size/delay，保证每次构建稳定。
- 深色主题用更暗更弱的点，避免「噪点」感；浅色同理。`opacity .1` 上下。
- 只做氛围层：点全部 `pointer-events: none`、`z-index` 低于正文，绝不遮挡阅读与点击。
- 沿用 antfu 的「散点作为背景」手法，但改为**构建期静态渲染**，契合本站「无运行时」哲学。

### 6.3 三态波纹

**详情页顶部大状态灯**：`ContentItemPage` 在项目文章页的 header 区（`.project-facts` 之前或其中）渲染一个状态灯组件，包住中心状态圆点，两个同心环错开 1.2s 缓慢扩散，颜色取 `var(--status-*)`：

```html
<div class="status-ripple status-ripple--active">
  <span class="status-ripple__ring"></span>
  <span class="status-ripple__ring status-ripple__ring--delayed"></span>
  <span class="status-ripple__core"></span>
</div>
```

```css
.status-ripple__ring { position:absolute; inset:0; border-radius:50%; border:1.5px solid currentColor; opacity:0; animation: ripple 2.4s ease-out infinite; }
.status-ripple__ring--delayed { animation-delay: 1.2s; }
@keyframes ripple { 0% { transform: scale(.7); opacity:.7 } 80%,100% { transform: scale(1.35); opacity:0 } }
```

**目录卡片左上角常显角标**：`ProjectCard` 左上角一个 8px 状态色圆点，无封面卡与有封面卡均叠加。hover 时才出现**极弱**脉冲（避免整页动画噪音）：

```html
<span class="project-status project-status--active" aria-hidden="true"></span>
```

- 三色仅表示状态，不承载进度百分比（无进度字段）。
- `active` 是否动画更有区分度待实现时用 E2E 截图确认；若三态同动画会失去「状态差异」，考虑让角标常显静止、仅详情状态灯动画。**此细节在实现时以视觉一致性为准，不需要额外改动数据。**

## 7. 无障碍与降级

- 波纹与角标是**纯装饰性状态指示**，状态文本（`active` 等）已在内容/元信息里以文字表达，颜色不作唯一传达手段；角标与状态灯 `aria-hidden` 或配 `aria-label`。
- 所有动效包在 `@media (prefers-reduced-motion: reduce)` 内关闭；全局已有的过渡压缩兜底继续生效。
- 散点层 `pointer-events: none`，不干扰键盘与读屏。
- Simple Icons 图标内联 SVG 加 `role="img"` + `<title>`（或 `aria-hidden` 配文字标题），不放空 `alt`。

## 8. 测试策略

按风险匹配，主要在**单元 + 构建 + E2E 截图**三层验证：

- **单元**（`tests/unit/tech-icons.test.ts`，新增）：`techIcons` 只含合法键、每项有非空 `path` 且以字母开头、未收录键回退逻辑正确。
- **构建断言**：`astro build` 后 `dist/projects/*/index.html` 应包含状态角标 class、散点层、内联技术图标 SVG path（无外链请求）。
- **E2E**（更新 `tests/e2e/projects.spec.ts` 或新增 visual 用例）：卡片 hover 后无紫边框（断言 border-color 不等于 focus 值 / 卡片有灰化态）；详情页存在 `.status-ripple`；技术图标已渲染；五个分区随新增项目动态扩展（用 fixture 临时多放一个同分类项目，断言该分区卡片数 +1）。CSS hover 态断言用 `page.hover()` + 读计算样式。
- 由于本机 Chromium 已装好，E2E 可真实跑通并出截图供验收。

## 9. 兼容性与风险

| 风险 | 处置 |
|---|---|
| `filter: saturate()` 对封面图的合成成本与兼容性 | 图已优化；作用于静态 `<a>`，成本可忽略；不支持的旧浏览器即时切换 |
| 三色在深浅主题下对比不足 | 用调色盘 600(浅)/200(深) 分档，见 §5.1；实现时用对比度工具复核 |
| 散点定位抖动/遮挡 | 固定种子 + 低于正文 z-index；E2E 截图确认阅读区无遮挡 |
| Simple Icons 图标 `path` 许可/归属 | 文件头注明来源、ISC 许可、品牌名；只取需要的几个 |
| 状态动画三态不区分 | 实现时以视觉一致性与截图为准，不引入额外字段 |
| 与一轮「hover 紫边」文档冲突 | §3.1 已记录为迭代修正；落地后同步更新 content-authoring 相关行 |

## 10. 明确不做

- 不新增运行时 JS / Canvas / 新依赖（Simple Icons 仅抄数据，不装包）。
- 不改数据模型、不加必填字段、不改路由结构。
- 不把卡片墙改成 antfu 式长列表布局。
- 不给进度/百分比做单独视觉。
- 不触碰 Notes / Tips / Interests / 搜索 / 媒体外壳。
