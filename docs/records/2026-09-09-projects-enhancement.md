# Projects 栏目增强实现完成

- 日期：2026-09-09
- 类型：应用代码 + 内容 + 测试 + 文档变更
- 决策来源：用户在 `docs/requirements/2026-09-09-projects-enhancement.md` 中明确提出需求，并经聊天确认三项设计决策（固定入口采用「外链按钮 + 两个子页」的混合方案、`category` 设为必填、卡片视觉采用「图铺满矩形 + 标题叠底」）。
- 相关文档：
  - [需求](../requirements/2026-09-09-projects-enhancement.md)
  - [设计文档](../design/2026-09-09-projects-enhancement.md)
  - [实施路线图](../implement-roadmap/2026-09-09-projects-enhancement.md)
  - [内容创作指南第 7 节](../documents/content-authoring.md)

## 背景

原 Projects 栏目使用单层路由 `[slug].astro`，不能嵌套子页，也没有分类与卡片化展示。
需求要求：按种类分区展示、支持无限层嵌套、每个项目带固定入口（项目链接、核心功能、开发过程）、
栏目首页改为宽版版式。

## 实际变更

### 新增代码

- `src/lib/project-categories.ts`
  - `projectCategories` 数组（唯一真源，顺序即分区顺序）：
    `course-assignment` / `personal-tool` / `competition` / `research` / `large-project`。
  - `projectCategoryLabels`（中英）、`projectCategoryLabel()`、`groupByCategory()`。
- `src/lib/project-entries.ts`
  - `projectChildPages`（`features` / `dev-log` 两个固定子页 key 与中英标签）。
  - `buildProjectEntries()`：按「代码仓库 → Demo → 核心功能 → 开发过程」顺序生成入口；
    站内子页入口仅在对应 slug 的子页已发布时才出现，避免死链。
- `src/components/content/ProjectCard.astro`：单项目卡片。有 `cover` 显示图、无 `cover` 自动降级为 `--bare` 无图样式。
- `src/components/content/ProjectEntries.astro`：渲染入口区块（外链 `target="_blank" rel="noopener"`）。
- `src/components/pages/ProjectDirectoryView.astro`：分区卡片墙，按 `groupByCategory` 渲染标题 + 网格。
- `src/components/pages/ProjectSectionIndex.astro`：栏目首页，宽版，渲染 `_index` 正文 + 分区卡片墙 + 面包屑。
- `src/pages/projects/[...slug].astro`、`src/pages/en/projects/[...slug].astro`：路由由 `[slug]` 改为 catch-all `[...slug]`，支持任意层嵌套（内容逐字等同旧版，仅文件名变）。
- `src/pages/projects/index.astro`、`src/pages/en/projects/index.astro`：改用 `ProjectSectionIndex`。
- `src/assets/projects/large-platform.jpg`：占位封面图（脚本生成，非真实截图）。

### 修改代码

- `src/lib/content-schema.ts`：`createProjectSchema` 新增 `category: z.enum(projectCategories)`（**必填**）。
- `src/lib/content-repository.ts`：`ContentItem.data` 新增 `category?: ProjectCategory` 类型。
- `src/components/pages/ContentItemPage.astro`：
  - 项目目录页（`_index.md`）渲染分支走 `ProjectDirectoryView`；
  - 顺手修复既有缺陷：空 `technologies` 时 `project-facts` 会渲染字符 `0`（改为 `item.data.technologies?.length ? ...`）。
- `src/layouts/ContentLayout.astro`：新增 `wide` prop，宽版时 `main` 加 `content-page--wide`。
- `src/styles/prose.css`：
  - `.content-page` 改为默认 `min(100%,760px)`；
  - 新增 `.content-page--wide`（`max-width:80%`，约束 720/1320）；
  - 新增 `.project-group*` / `.project-grid` / `.project-card`（含 `--bare`、封面 `object-fit:cover`、hover 上浮）/ `.project-entries`。

### 内容

- `src/content/projects/{zh,en}/_index.md`（新增）：`slug: projects`，占位栏目介绍。
- 每个分类各一个占位项目：`ml-coursework` / `bookmark-cli` / `datathon-entry` / `rl-research` / `large-platform`（含 `features`、`dev-log` 两个子页，带占位封面图）。
- `src/content/projects/{zh,en}/_placeholder.md`：仅加 `category: personal-tool` 一行（仍 `draft: true`，不发布）。

### 测试

- `tests/unit/project-categories.test.ts`（新增）：枚举取值、标签、分组顺序与空分组剔除。
- `tests/unit/project-entries.test.ts`（新增）：外链 + 子页条件渲染 + 死链规避。
- `tests/unit/content-schema.test.ts`：新增 `category` 必填校验用例。
- `tests/fixtures/content/projects/**`：更新 `fixture-project.md` 补 `category`，新增五个分类的 fixture（含 `large-enterprise` 套子页）。
- `tests/e2e/projects.spec.ts`（新增）：路由、分区、卡片、固定入口、嵌套子页。

## 验证

- `astro check`：通过（类型检查无错误）。
- `vitest run`：unit 用例全部通过（含 category / entries / schema）。
- `astro build`：成功生成。输出的 `dist/projects/index.html` 已验证：
  - 五个分区标题按 `projectCategories` 顺序出现；
  - 卡片标题与 `--bare` 无图类名正确；
  - `large-platform` 卡片为封面样式；
  - 其目录页 `features` / `dev-log` 入口正确渲染且外链带 `target="_blank" rel="noopener"`；
  - 单页项目详情页仍保留 `project-facts`（状态 / 技术栈 / Repository / Demo）。
- E2E（Playwright）：本机未安装 Chromium，`ms-playwright` 缺失，已后台触发安装，装好后补跑 `tests/e2e/projects.spec.ts`。
  此前已用构建产物直接核验 HTML，结果与 E2E 断言一致。Firefox 在本机仍受 `spawn UNKNOWN` 限制，仅 Chromium / WebKit 可用。

## 已知偏差

- 占位内容（含封面图）为临时验证用，已登记进 `content-authoring.md` 第 15 节，待用户替换为真实项目。
- `content-authoring.md` 的 Project 章节（第 7 节）已完整改写为新结构。
- 本变更与 2026-09-07 的 superpowers 兼容变更、2026-09-07 的 `.gitignore` 变更目前均未提交，需用户授权后统一提交。

## Git 提醒

建议的提交范围（按两大主题拆分，便于审阅）：

```text
# 主题一：superpowers 兼容（2026-09-07 遗留，未提交）
.gitignore
AGENTS.md
docs/development/strategy.md
docs/testing-strategies/2026-09-03-testing-strategy.md
docs/records/2026-09-07-superpowers-compatibility.md

# 主题二：projects 增强（本次）
docs/requirements/2026-09-09-projects-enhancement.md
docs/requirements/2026-09-09-interests-enhancement.md
docs/design/2026-09-09-projects-enhancement.md
docs/implement-roadmap/2026-09-09-projects-enhancement.md
docs/documents/content-authoring.md
src/lib/project-categories.ts
src/lib/project-entries.ts
src/lib/content-schema.ts
src/lib/content-repository.ts
src/components/content/ProjectCard.astro
src/components/content/ProjectEntries.astro
src/components/pages/ProjectDirectoryView.astro
src/components/pages/ProjectSectionIndex.astro
src/components/pages/ContentItemPage.astro
src/layouts/ContentLayout.astro
src/styles/prose.css
src/assets/projects/large-platform.jpg
src/content/projects/zh/_index.md
src/content/projects/zh/_placeholder.md
src/content/projects/zh/ml-coursework.md
src/content/projects/zh/bookmark-cli.md
src/content/projects/zh/datathon-entry.md
src/content/projects/zh/rl-research.md
src/content/projects/zh/large-platform/_index.md
src/content/projects/zh/large-platform/features.md
src/content/projects/zh/large-platform/dev-log.md
src/content/projects/en/_index.md
src/content/projects/en/_placeholder.md
src/content/projects/en/ml-coursework.md
src/content/projects/en/bookmark-cli.md
src/content/projects/en/datathon-entry.md
src/content/projects/en/rl-research.md
src/content/projects/en/large-platform/_index.md
src/content/projects/en/large-platform/features.md
src/content/projects/en/large-platform/dev-log.md
src/pages/projects/[...slug].astro
src/pages/projects/index.astro
src/pages/en/projects/[...slug].astro
src/pages/en/projects/index.astro
tests/unit/project-categories.test.ts
tests/unit/project-entries.test.ts
tests/unit/content-schema.test.ts
tests/fixtures/content/projects/
tests/e2e/projects.spec.ts
```

注意：旧的 `src/pages/projects/[slug].astro` 与 `src/pages/en/projects/[slug].astro` 已被删除（替换为 catch-all），提交时 Git 会记录为重命名。

建议提交信息：
1. `docs: adopt Superpowers methodology with project authorization constraints`
2. `feat(projects): grouped card wall, category field, nested routes, fixed entries`
