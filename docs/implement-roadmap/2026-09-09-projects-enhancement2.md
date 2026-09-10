# 2026-09-09 Projects 视觉增强二轮 实施路线图

对应设计：[`2026-09-09-projects-enhancement2.md`](../design/2026-09-09-projects-enhancement2.md)
对应需求：[`2026-09-09-projects-enhancement2.md`](../requirements/2026-09-09-projects-enhancement2.md)

本路线图基于**已批准**的一轮实现（分类分区卡片墙 + 无限层 + 固定入口，均已落地并验证），在其上做视觉迭代。实现遵循 TDD，先写失败测试再实现。

## 总览

| 阶段 | 主题 | 依赖 |
|---|---|---|
| T1 | 状态令牌 + 技术图标数据 | 无 |
| T2 | 散点氛围层 + hover 变灰 + 卡片状态角标 | T1（状态令牌） |
| T3 | 详情页三态波纹状态灯 + 技术图标渲染 | T1（图标数据）、T2（令牌） |
| T4 | fixtures / 单测 / E2E / 全量验证 | T1–T3 |

## T1 状态令牌 + 技术图标数据

**文件**：`src/styles/tokens.css`（改）、`src/data/tech-icons.ts`（新）。

1. `tokens.css` `:root` 加：
   - `--status-active: #185fa5; --status-completed: #3b6d11; --status-archived: #a32d2d;`
   - 注释说明供正文/图标用的 ≥4.5:1 深档。
2. `:root[data-theme='dark']` 加浅档：`--status-active: #85b7eb; --status-completed: #97c459; --status-archived: #f09595;`
3. 新建 `src/data/tech-icons.ts`：`export interface TechIcon { title: string; path: string; hex: string }`，`export const techIcons: Record<string, TechIcon>` 收录 `go` / `python` / `typescript` / `astro` / `pytorch`（数据取自 Simple Icons，ISC）。头部注释注明来源与许可。`export function techIconFor(name: string)`：按小写键查表，未命中回退 `null`。
4. **先写测试** `tests/unit/tech-icons.test.ts`（RED）：合法键、非空 path、回退 null。

**验证**：vitest 单测绿；`astro check`。

## T2 散点氛围层 + hover 变灰 + 卡片状态角标

**文件**：`src/styles/prose.css`、`src/styles/global.css`、`src/components/content/ProjectCard.astro`、`src/components/pages/ProjectSectionIndex.astro`（改）。

1. `.project-card` hover：删除 `border-color: var(--focus)`；新增 `filter: saturate(.35) brightness(.985); transform: translateY(-1px);` 与 `.project-card:hover .project-card__title { color: var(--muted) }`；`:active` 复位 `transform`。过渡在 `.project-card` 上扩展 `filter`、`transform`。
2. `.project-card` 增加常显状态角标 `.project-status`：左上 8px 圆点，`background: var(--status-*)`，`aria-hidden`。三色 class `--active/--completed/--archived` 映射 `content-schema` 的 status 值（组件里做映射）。有封面（absolute 图）与 bare 卡都叠加。
3. 散点氛围层组件（新建 `src/components/content/ProjectAtmosphere.astro` 或在页面内联）：固定种子伪随机在容器高内布 ~40 个 1–3px 圆点，输出 `<span class="project-atmosphere__dot">`（style 设 left/top/size/color/delay）；外层 `.project-atmosphere` `position:absolute; inset:0; pointer-events:none; overflow:hidden; z-index:0`。
4. `.content-page--wide` 设 `position: relative`，正文内容包进 `z-index:1` 层，保证点不叠在正文上（正文背景不透明处自然遮住）。
5. 散点动画 `@keyframes dot-float` 包裹 `@media (prefers-reduced-motion: no-preference)`；`reduce` 时 `animation: none`。
6. 在 `ProjectSectionIndex`（栏目首页）接入 `.project-atmosphere`。

**验证**：`astro build` 后 `dist/projects/index.html` 含 `.project-status`、`.project-atmosphere` 与圆点；E2E hover 后 border-color 不等于 focus 紫。

## T3 详情页三态波纹状态灯 + 技术图标渲染

**文件**：`src/components/pages/ContentItemPage.astro`（改）、`src/styles/prose.css`（加）、`src/components/content/TechIcon.astro`（新，可选）。

1. 状态灯：在项目**非目录**详情页（`isProjectDirectory === false`）`.project-facts` 处替换/前置一个波纹状态灯，中心状态点 + 两个延时同心环。组件把 `item.data.status` 映射为 `active/completed/archived` class 与颜色。
2. `.status-ripple` CSS：见设计 §6.3；`aria-hidden` + 旁边有文字状态；`prefers-reduced-motion` 关闭。
3. 技术栈图标：`ContentItemPage` 里把 `technologies` 每项经 `techIconFor` 找图标，命中则渲染内联 SVG（`viewBox 0 0 24 24`），未命中回退文本；图标带 `title`（供读屏）。放在 `.project-facts` 技术栈区。
4. `.project-facts` 支持图标化技术列表（flex 布局）。

**验证**：build 后详情页含 `.status-ripple--active` 等、内联 tech SVG（无外链）。

## T4 fixtures / 单测 / E2E / 全量验证

1. 更新 fixtures：给 `tests/fixtures/content/projects/*` 补上各 status 的示例（active/completed/archived 各至少一件），确保详情页能渲染三种状态灯。
2. 新增 `tests/unit/tech-icons.test.ts`（T1 RED 已写）。补项目 fixture 用到的技术如 `Python`（保证 techIconFor 命中）。
3. 更新 `tests/e2e/projects.spec.ts`：新增用例
   - 卡片 hover 后 `.project-card` 计算样式的 `filter` 含 `saturate`、`border-color` 不等于 `rgb(102 87 200)` 紫；
   - 项目首页卡片含 `.project-status`（三个状态各断言颜色/class）；
   - 项目详情页含 `.status-ripple` 且状态点颜色匹配；
   - 详情页技术栈含内联 `<svg>`（tech 命中项）；
   - 五个分区「动态扩展」：向一个分类新增第二件 fixture，断言该分区卡片数 2。
4. 跑全量：`astro check` → `vitest run` → `astro build` → Playwright（Chromium）截图供验收。
5. 同步文档：`docs/documents/content-authoring.md`（如有技术栈图标说明）、`docs/records/2026-09-09-projects-enhancement2.md`。

## 授权与 Git

本轮为**已批准实现**。仅 `docs/requirements/` 不触碰。所有 git 变更保持未提交，收尾时给用户提交建议，不自行 commit。
