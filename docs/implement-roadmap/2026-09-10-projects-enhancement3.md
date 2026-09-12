# 2026-09-10 Projects 入口卡片放大与副标题 实施路线图

对应设计：[`docs/design/2026-09-10-projects-enhancement3.md`](../design/2026-09-10-projects-enhancement3.md)
对应需求：[`docs/requirements/2026-09-10-projects-enhancement3.md`](../requirements/2026-09-10-projects-enhancement3.md)
对应测试文档：[`docs/testing-strategies/2026-09-12-rich-content-rendering.md`](../testing-strategies/2026-09-12-rich-content-rendering.md)

> 状态：**实施中**。用户已于 2026-09-12 给出「批准设计…然后进行实现」的明确授权。
> 实施记录：`docs/records/2026-09-10-projects-enhancement3.md`

---

## 授权与范围说明

| 项 | 内容 |
| --- | --- |
| 授权原话 | 「批准设计，完成roadmap，然后进行实现」 |
| 覆盖设计决策 | §4.1 网格单值改动、§4.2 可选 `subtitle`、§4.3 卡片结构加 `.project-card__meta`、§4.4 副标题排版与 2 行截断、§4.5 封面 `5 / 4` |
| 已接受的连带影响 | 1024 视口 3 列 → 2 列；`large-platform.jpg` 裁左右约 17%；`.project-card--bare` 一起变高 |
| 不在范围 | 不改 `.page-frame` 上限、不引入媒体查询列数、不给副标题富文本、不改封面素材文件本身 |

---

## 阶段划分

### 阶段 0：准备（无代码改动）

| # | 任务 | 产出 |
| --- | --- | --- |
| T0.1 | 确认三处「已接受的连带影响」按设计默认执行 | 记录在实施记录里 |
| T0.2 | 确认 `prose.css` 当前行号未漂移（第 9 / 12 / 17–19 / 32 行） | 若漂移按语义定位，不按行号改 |

### 阶段 1：内容模型（可单测，先做）

| # | 任务 | 文件 | 验收 |
| --- | --- | --- | --- |
| T1.1 | 先写测试：`subtitle` 可省略、可填写、空串被拒 | `tests/unit/content-schema.test.ts` | 先红：`subtitle` 尚未进 schema |
| T1.2 | `createProjectSchema` 新增 `subtitle: z.string().trim().optional()` | `src/lib/content-schema.ts` | 单测转绿；`astro check` 0 错 |

**注意**：`subtitle` 只加在 project schema，**不进** `createCommonContentSchema`（其它栏目没有这个位置）。

### 阶段 2：组件结构

| # | 任务 | 文件 | 说明 |
| --- | --- | --- | --- |
| T2.1 | 把裸 `<h3>` 包进 `.project-card__meta`，并加副标题元素 | `src/components/content/ProjectCard.astro` | 回退逻辑 `item.data.subtitle ?? item.data.description` 就地一行，不抽模块 |
| T2.2 | 改写标题定位规则：绝对定位上移到 `__meta`，`__title` 改静态 | `src/styles/prose.css` | 同步改 `.project-card--bare` 的两条规则（`__meta` 改 `position: static`） |

**为什么 T2.1 与 T2.2 必须同一批完成**：只改组件会让标题离开绝对定位后掉到封面下方（卡片 `overflow: hidden` 裁掉），
只改 CSS 会让 `.project-card__meta` 不存在而规则空转。

### 阶段 3：尺寸与比例

| # | 任务 | 文件 | 改前 → 改后 |
| --- | --- | --- | --- |
| T3.1 | 网格最小宽度 | `src/styles/prose.css` 第 9 行 | `minmax(240px, 1fr)` → `minmax(min(100%, 300px), 1fr)` |
| T3.2 | 封面比例 | `src/styles/prose.css` 第 12 行 | `aspect-ratio: 3 / 2` → `aspect-ratio: 5 / 4` |
| T3.3 | 副标题排版与 2 行截断 | `src/styles/prose.css` | `font: .85rem/1.4 var(--ui)`、`color: var(--muted)`、`-webkit-line-clamp: 2` |

**T3.1 与 T3.2 互不干扰**：列数由 `minmax()` 决定，与卡片高度无关，可分别验证。

### 阶段 4：fixture

| # | 任务 | 文件 | 用途 |
| --- | --- | --- | --- |
| T4.1 | 新增带 `subtitle` 的项目 fixture（中英各一） | `tests/fixtures/content/projects/{zh,en}/rich-content.md` | 副标题渲染 + 2 行截断 + 项目详情页富文本（另一任务的 P1） |
| T4.2 | 该 fixture 归入 `large-project` 分类 | 同上 | **刻意避开 `personal-tool`**：现有 E2E 断言该组恰好 2 张卡，加进去会破坏既有断言 |

**fixture 变更纪律**：新增条目后必须重跑全量 E2E，不得因「只是加了一条 fixture」跳过回归。

### 阶段 5：测试与验收

| # | 任务 | 文件 |
| --- | --- | --- |
| T5.1 | 网格列数几何断言：1440 / 1680 读 `gridTemplateColumns`，**恰好 3 条轨道** | `tests/e2e/projects.spec.ts` |
| T5.2 | 卡片比例断言：`width / height ≈ 1.25`（容差 ±0.02） | 同上 |
| T5.3 | **可见封面高**断言：`卡片高 − 信息条高 > 145.2px`（实测预期 191.7–210.7） | 同上 |
| T5.4 | 副标题断言：有 `subtitle` 显示原文；无 `subtitle` 显示 `description`（回退） | 同上 |
| T5.5 | **反向断言**：副标题内不存在 `<strong>` / `<img>` / `.katex`（纯文本插值） | 同上 |
| T5.6 | 1024 视口截图确认 3 列 → 2 列（需用户知情的副作用） | `tests/artifacts/2026-09-10-projects-enhancement3/` |
| T5.7 | 全量回归：`vitest run` + `astro check` + `astro build` + Chromium E2E 全量 | — |
| T5.8 | 记录文档 | `docs/records/2026-09-10-projects-enhancement3.md` |

**T5.3 为什么不能用「卡片变高了」代替**：改列数或改容器宽度都会让高度变化，
那与「图片区域真的变大」是两件事。必须量 `卡片高 − 信息条高` 这个差值。

---

## 风险与对策

| 风险 | 对策 |
| --- | --- |
| 包一层 `__meta` 破坏 `--bare` 卡片居中 | `--bare` 下 `__meta` 改 `position: static`，由既有的 `display: grid; place-items: center` 居中；截图核对 |
| 1024 视口 3 列 → 2 列属计划外视觉变化 | 已显式声明；单独截 1024 档交用户确认 |
| `object-fit: cover` 开始裁切现有 3:2 封面 | 素材约定问题，实现侧无法消除；已在设计文档记录，等用户换图 |
| 既有 E2E 断言卡片数量被新 fixture 打破 | fixture 归入无计数断言的 `large-project` 组；仍重跑全量 |

---

## 不在本次范围

- 不改 `.page-frame` 的 1440px 上限（全站共用，风险外溢）。
- 不引入媒体查询式的显式列数。
- 不给副标题加富文本 / 链接能力。
- 不替换 `src/assets/projects/*.jpg` 素材文件本身。
