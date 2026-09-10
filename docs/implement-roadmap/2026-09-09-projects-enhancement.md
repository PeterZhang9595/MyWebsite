# 2026-09-09 Projects 增强实施路线图

对应设计：[`docs/design/2026-09-09-projects-enhancement.md`](../design/2026-09-09-projects-enhancement.md)
对应需求：[`docs/requirements/2026-09-09-projects-enhancement.md`](../requirements/2026-09-09-projects-enhancement.md)

工作方式：TDD。每个任务先写/改测试 → 确认红 → 写实现 → 确认绿。
工作区：**当前分支 `main`，改动保持未提交**（未获 worktree 授权，按 `strategy.md` §16 处理）。

---

## T1 · 分类单一真源模块

**文件**：新增 `src/lib/project-categories.ts`

导出 `projectCategories`（顺序即分区顺序）、`ProjectCategory` 类型、`projectCategoryLabels`（中英）、`projectCategoryLabel()`、`groupByCategory()`。

`groupByCategory(items, pick)` 按 `projectCategories` 顺序返回 `{category, items}[]`，**跳过空分区**。

**验证**：`pnpm vitest run tests/unit/project-categories.test.ts`

---

## T2 · Schema 追加必填 category（RED 先行）

**文件**：`src/lib/content-schema.ts`

`createProjectSchema` 增加 `category: z.enum(projectCategories)`。

**先改测试**：
- `tests/unit/content-schema.test.ts` —— 既有项目断言补 `category`；新增「缺 category 报错」「非法 category 报错」
- 新增 `tests/unit/project-categories.test.ts`

**验证**：先 `pnpm vitest run` 确认红（缺失报错用例失败），改完确认绿。

---

## T3 · 路由升级为 catch-all

**文件**：
- 新增 `src/pages/projects/[...slug].astro`，删除 `src/pages/projects/[slug].astro`
- 新增 `src/pages/en/projects/[...slug].astro`，删除 `src/pages/en/projects/[slug].astro`

内容与 Notes 版同构，仅 section 换成 `projects`。`index.astro` 保留（静态路由优先）。

**验证**：`pnpm run check`

---

## T4 · 目录页视图组件

**文件**：
- 新增 `src/components/pages/ProjectDirectoryView.astro`（正文 + 固定入口 + 分区卡片墙）
- 新增 `src/components/pages/ProjectSectionIndex.astro`（栏目根，复用上一组件）
- 新增 `src/components/content/ProjectEntries.astro`
- 新增 `src/components/content/ProjectCard.astro`
- 改 `src/components/pages/ContentItemPage.astro`：`section === 'projects' && item.isDirectory` 时走 `ProjectDirectoryView`
- 改 `src/pages/projects/index.astro`、`src/pages/en/projects/index.astro` 指向 `ProjectSectionIndex`

固定入口规则：
- 项目链接 —— `repositoryUrl` / `demoUrl` 存在即渲染外链按钮（`target="_blank" rel="noopener"`）
- 核心功能 / 开发过程 —— 仅当 `features` / `dev-log` 子页存在时渲染链接

**验证**：`pnpm run check`

---

## T5 · 版式与卡片样式

**文件**：
- `src/layouts/ContentLayout.astro` —— 新增 `wide` prop → `content-page--wide`
- `src/styles/prose.css` —— `.content-page--wide`、`.project-grid`、`.project-card`、`.project-entries`、分区标题

`.content-page--wide { width: 80%; max-width: 1680px; }`，≤560px 放宽到 92%。
卡片 `aspect-ratio: 3 / 2`，有封面铺满 + 标题压底带 scrim；无封面透明底 + 标题居中。

**验证**：`pnpm run check` + 目测构建产物

---

## T6 · Fixtures 更新

**文件**：`tests/fixtures/content/projects/{zh,en}/`

- `_index.md`（slug `projects`）
- 五个分类各一个示例条目
- 一组嵌套示例：`large-enterprise/_index.md` + `features.md` + `dev-log.md`
- 既有 `fixture-project.md` 补 `category`（保持 `projects/fixture-project/` 路由测试通过）

**验证**：`TEST_CONTENT_FIXTURES=1 pnpm run build`

---

## T7 · E2E 测试

**文件**：新增 `tests/e2e/projects.spec.ts`

断言：五分区按固定顺序出现、卡片链接可进入详情、嵌套子页 200、宽版布局 `main` 宽度约 80%、入口链接 href 正确。

**验证**：`pnpm run build && pnpm exec playwright test --project=chromium tests/e2e/projects.spec.ts`

---

## T8 · 占位内容（供预览）

**文件**：`src/content/projects/{zh,en}/`

- `_index.md`（slug `projects`，`draft: false`）
- 五个分类各一个占位项目，`draft: false`，均带 `publishedAtOverride` / `updatedAtOverride`
  以规避「未提交即发布」的构建失败
- 其中大型项目示例展开为 `_index.md` + `features.md` + `dev-log.md`
- 既有 `_placeholder.md` 补 `category`（保持 `draft: true`）

**验证**：`pnpm run build` 通过且产物含 `/projects/` 及子页

---

## T9 · 全量验证与收尾

- `pnpm run check`
- `pnpm vitest run`
- `pnpm run build`
- Playwright Chromium 全量（Firefox 在本机 `spawn UNKNOWN`，跳过）
- 补 `docs/documents/content-authoring.md` 的 Projects 字段说明与 `docs/records/` 记录

**不做**：任何 git 提交、分支、合并操作。
