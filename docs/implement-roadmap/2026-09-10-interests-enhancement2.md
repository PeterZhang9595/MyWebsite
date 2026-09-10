# 2026-09-10 Interests 兴趣页增强二期实施路线图

对应设计：[`docs/design/2026-09-10-interests-enhancement2.md`](../design/2026-09-10-interests-enhancement2.md)
对应需求：[`docs/requirements/2026-09-10-interests-enhancement2.md`](../requirements/2026-09-10-interests-enhancement2.md)
前置路线图：[`docs/implement-roadmap/2026-09-10-interests-card-wall.md`](./2026-09-10-interests-card-wall.md)（一期，已完成）

> 状态：**用户已批准**（2026-09-10 会话中逐条确认决策并指示「进行设计开发」）。
> 实施记录：[`docs/records/2026-09-10-interests-enhancement2.md`](../records/2026-09-10-interests-enhancement2.md)

---

## 阶段划分

### 阶段 0：准备

| # | 任务 | 产出 |
|---|---|---|
| T0.1 | 设计初稿可视化（4 张交互稿） | 已完成（主页重叠卡组 / justified 墙 / 整页渐变去黄 / 浮层长文） |
| T0.2 | 用户逐条确认 4 个决策点 | 已完成（见设计 §1.1） |
| T0.3 | 设计文档 + 路线图落盘 | 本文档与同名设计文档 |

### 阶段 1：纯函数与工具（TDD，先做，可独立验证）

| # | 任务 | 文件 | 验收 |
|---|---|---|---|
| T1.1 | 写 justified 算法单测（红） | `tests/unit/justified.test.ts` | 测试先失败 |
| T1.2 | 实现 justified 算法（绿） | `src/lib/justified.ts` | 单测全绿；覆盖末行策略与边界 |
| T1.3 | 写遮盖量单测 | `tests/unit/interests-overlap.test.ts` | 红 → 绿 |
| T1.4 | 实现遮盖/让位计算 | `src/lib/interests-overlap.ts` | 全绿 |

**验收**：`vitest` 全绿，两模块 100% 分支覆盖（边界与末行策略）。

### 阶段 2：共享组件与内容模型

| # | 任务 | 文件 | 说明 |
|---|---|---|---|
| T2.1 | `ContentLayout` 增 `plainPath` prop | `src/layouts/ContentLayout.astro` | `<main data-plain-path>` |
| T2.2 | 内容文件清理 `subtitle` 时间文案 | `src/content/interests/{zh,en}/*/_index.md` | 12 个文件，改副标题或清空 |
| T2.3 | 生成 6 种比例占位图 | `tests/fixtures/assets/` | 1:1 / 4:3 / 3:2 / 16:9 / 2:3 / 3:4 |
| T2.4 | fixture 内容改用占位图 | `tests/fixtures/content/interests/**` | 覆盖 6 比例 + 1 个无图卡 |

**验收**：`astro check` 通过；fixture 可被构建加载。

### 阶段 3：主页改造（需求 2）

| # | 任务 | 文件 | 说明 |
|---|---|---|---|
| T3.1 | 删除轨道区 `h2`，section 加 `aria-label` | `InterestsHome.astro` | 消除与左卡文案的重复 |
| T3.2 | 左引导卡与右侧卡组留距 | `interests.css` | `margin-right: clamp(1.5rem,4vw,3.5rem)` |
| T3.3 | 右卡改 1:1 | `interests.css` | `aspect-ratio: 1/1`，删 `min-height` |
| T3.4 | 负 margin 遮盖 25% | `interests.css` + `InterestsHome.astro` | `--card-w` 单一来源驱动 |
| T3.5 | 标题限制在左侧 75% | `interests.css` | `max-width: 72%` |
| T3.6 | hover 突出 + 后续卡让位 | `interests.css` | `z-index: calc(100 - var(--i))` + `~ .rail-card` |
| T3.7 | reduced-motion 关闭变换 | `interests.css` | 沿用一期策略 |

**验收**：视觉与设计初稿 ① 一致；hover 时标题完整露出。

### 阶段 4：子页改造（需求 3 + 4）

| # | 任务 | 文件 | 说明 |
|---|---|---|---|
| T4.1 | 渐变层改 `position: fixed` 铺满视口 | `interests.css` | 去掉容器圆角/内边距/overflow |
| T4.2 | 面包屑去黄 + 去边框 | `interests.css` | `main[data-plain-path] .terminal-path__line` |
| T4.3 | 卡牌墙改 justified 墙 | `InterestsCategoryPage.astro` + `interests.css` | 行渲染 + 图注 |
| T4.4 | 图注去时间、帧色转色条 | 同上 | `border-left: 3px solid var(--frame)` |
| T4.5 | 无图卡片按假比例参与 | 同上 | `4/3` 兜底 + 占位块 |

**验收**：视觉与设计初稿 ② ③ 一致；不同比例图片排布无拉伸。

### 阶段 5：浮层改造（需求 1）

| # | 任务 | 文件 | 说明 |
|---|---|---|---|
| T5.1 | 背面改可滚动小页面 | `interests.css` + `interests.js` | 内层 `overflow-y:auto` + `min-height:0` |
| T5.2 | 背面正文按段落渲染 | `interests.js` | `\n\n` 拆 `<p>`，不用 `innerHTML` |
| T5.3 | 滚动区可键盘聚焦滚动 | `interests.js` + `interests.css` | `tabindex="0"` + `aria-label` |
| T5.4 | 锁定正面图片 `object-fit: contain` | `interests.css` | 加 E2E 断言防回归 |

**验收**：长文可滚动；图片在放大态与翻面态均保持比例。

### 阶段 6：测试与验收

| # | 任务 | 文件 |
|---|---|---|
| T6.1 | E2E：主页二期断言（无标题/间距/1:1/遮盖 25%/标题露出） | `tests/e2e/interests.spec.ts` |
| T6.2 | E2E：子页二期断言（渐变铺满/面包屑无底无框/justified 行高一致） | 同上 |
| T6.3 | E2E：浮层二期断言（长文可滚/图片 contain） | 同上 |
| T6.4 | 截图：主页 hover / justified 墙 / 浮层长文 / 双主题 | `tests/artifacts/2026-09-10-interests-enhancement2/` |
| T6.5 | 记录文档 | `docs/records/2026-09-10-interests-enhancement2.md` |

**验收**：`astro check` 0 错误；`vitest` 全绿；`astro build` 通过；Chromium E2E 全绿。

---

## 风险与对策

| 风险 | 对策 |
|---|---|
| 渐变层被 `.site-shell` 的 `z-index:1` 盖住 | 用 `z-index:-1` + 去容器 `overflow`；E2E 断言层高 ≥ 视口 |
| `TerminalPath` 不在 `.interests-category` 内，选择器选不中 | 已有对策：`ContentLayout` 加 `data-plain-path`（设计 §4.2） |
| justified 需要真实宽高比，无图卡片没有 | 构建期用 `ImageMetadata`；无图卡按 `4/3` 兜底；测试用真实占位图 |
| 卡片遮盖后点击落点错位 | 遮盖是纯视觉层叠，命中测试由 `z-index` 决定，上层卡接收点击，符合直觉 |
| `min-height:0` 遗漏导致背面滚不动 | 设计已显式标注；E2E 断言 `scrollHeight > clientHeight` |
| 极端比例（超宽/超长图）破坏行布局 | 单测覆盖 10:1 与 1:10 边界；实现中对比例做合理下限保护 |

---

## 不在本次范围

- 不新增 npm 依赖、不引入前端框架。
- 不改动 notes / tips / projects 板块。
- 背面富文本（图片、公式嵌入内容层）不在本轮，见设计 §10。
- 不做卡片的后台编辑工具（属 `2026-09-03-edit-tools-development.md`）。
