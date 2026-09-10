# 2026-09-09 Projects 页面增强设计

对应需求：[`docs/requirements/2026-09-09-projects-enhancement.md`](../requirements/2026-09-09-projects-enhancement.md)

## 1. 目标与范围

在**不破坏现有框架兼容性**的前提下重构 Projects 栏目：

1. 支持与 Notes 同等的**无限层页面嵌套**；
2. 目录页改为**按项目种类分区的卡片墙**；
3. 项目子页采用**更宽的版式**（左右各留 10% 边距）；
4. 每个项目目录页提供**固定的三个入口**。

**范围内**：路由、内容 schema、目录页组件、卡片样式、版式、i18n、测试与占位内容。
**范围外**：Notes / Tips / Interests 的版式与结构、音乐播放器、插画外壳、搜索索引行为。

## 2. 需求逐条映射

| 需求条目 | 实现方式 |
|---|---|
| ① 主页点击项目区进入项目主页 | 不变，`/` 与 `/en/` 的项目入口及 `/projects/` 路由保持 |
| ② 无限层嵌套 | `projects/[slug].astro` → `projects/[...slug].astro`（中英各一份），与 Notes 完全同构 |
| ③ _index 主页分区 + 卡片 + 种类字段 | 新增必填 `category` 字段；目录页按五种分类自上而下分区；卡片为矩形，可嵌封面图，默认透明 |
| ④ 子页版式 + 固定入口 | `ContentLayout` 增加 `wide` 变体（80% 宽）；项目目录页渲染「项目链接 / 核心功能 / 开发过程」入口 |
| ⑤ 调 superpowers + 出 test 与展示文件 | 本文档 → 实施路线图 → TDD（先红后绿）→ 每分区落占位内容供预览 |

## 3. 已确认决策

| 议题 | 结论 | 理由 |
|---|---|---|
| 三个固定入口的形态 | **混合**：「项目链接」取 frontmatter 的 `repositoryUrl` / `demoUrl` 渲染成外链按钮；「核心功能」「开发过程」指向两个标准子页 `features`、`dev-log` | 外链不需要内容文件；功能与过程需要长文，正好吃下新的无限层能力 |
| `category` 是否必填 | **必填**，五选一，缺失即构建报错 | 保证分区永远整齐，不出现漏放项目；枚举值集中一处，后续扩展只改一处 |
| 卡片排版 | **封面图铺满矩形，标题叠在下方**；无图时矩形透明、只留边框与标题 | 最贴近「矩形区域嵌入照片，默认透明」的描述 |

### 3.1 一个必要的让步：入口链接按存在性渲染

「核心功能」「开发过程」只有在 `<项目>/features`、` <项目>/dev-log` 两个子页面**真实存在**时才渲染为链接。
原因：无条件渲染会指向不存在的路由，产生 404 死链——这是明确的质量倒退。占位内容会为每个示例项目建齐两个子页，因此预览效果不受影响；新项目作者创建对应文件后入口即自动出现。

## 4. 数据模型

### 4.1 分类单一真源

新增 `src/lib/project-categories.ts`——**顺序、枚举值、双语标签全部集中在此**，schema、组件、测试统一从这里取：

```ts
export const projectCategories = [
  'course-assignment',  // 课程大作业
  'personal-tool',      // 自用小项目
  'competition',        // 比赛项目
  'research',           // 科研项目
  'large-project',      // 大型项目
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export const projectCategoryLabels: Record<Lang, Record<ProjectCategory, string>> = { zh: {...}, en: {...} };
export function projectCategoryLabel(lang: Lang, category: ProjectCategory): string;
export function groupByCategory<T>(items: T[], pick: (item: T) => ProjectCategory): { category: ProjectCategory; items: T[] }[];
```

`groupByCategory` **按 `projectCategories` 的固定顺序输出**，并丢弃空分区——新加分类只需在数组里插一项。

### 4.2 Schema 变更

`createProjectSchema` 追加一行：

```ts
category: z.enum(projectCategories),   // 必填
```

不新增 `cover` 字段——公共 schema 已有的 `cover: image().optional()` 直接复用，交由 Astro 做图片优化。未设置即需求中的「默认透明」。

### 4.3 frontmatter 示例

```yaml
---
title: 强化学习课程作业
description: 复现若干经典算法并做对比实验。
lang: zh
slug: projects/rl-coursework
translationKey: rl-coursework
draft: true
category: course-assignment      # 必填，五选一
status: completed
technologies: [Python, PyTorch]
repositoryUrl: https://github.com/...
demoUrl: https://...
cover: ../../assets/projects/rl-coursework.jpg   # 可选
order: 10
---
```

## 5. 路由与组件结构

```
src/pages/projects/index.astro          → ProjectSectionIndex（栏目根）
src/pages/projects/[...slug].astro      → ContentItemPage（单层 → catch-all）
src/pages/en/projects/...               同上

src/components/pages/ProjectSectionIndex.astro   栏目根：找 root(_index.md) + directChildren → ProjectDirectoryView
src/components/pages/ProjectDirectoryView.astro  目录页视图：正文 + 固定入口 + 分区卡片墙
src/components/content/ProjectEntries.astro      固定入口条
src/components/content/ProjectCard.astro         单张卡片
```

`ContentItemPage.astro` 增加一条分支：`section === 'projects' && item.isDirectory` 时改用 `ProjectDirectoryView`，其余行为（文章页、非项目目录页）**完全不变**。

这样栏目根与任意层级的 `_index.md` 共用同一套视图——分区卡片墙因此在**每一层**都生效，而不只是顶层，可扩展性更好。

## 6. 版式与视觉

### 6.1 宽版布局

`ContentLayout` 增加 `wide` 可选 prop，输出 `class="content-page content-page--wide"`：

```css
.content-page--wide { width: 80%; max-width: 1680px; }
@media (max-width: 560px) { .content-page--wide { width: 92%; } }
```

仅 Projects 的目录页与文章页传入 `wide`；Notes / Tips / Interests 维持 `min(100%, 760px)` 不变。

### 6.2 卡片

- 网格：`repeat(auto-fill, minmax(240px, 1fr))`，`gap: 1rem`
- 卡片：`aspect-ratio: 3 / 2`、1px `var(--divider)` 边框、`.5rem` 圆角、`overflow: hidden`
- 有封面：`<Image />` 铺满（`object-fit: cover`），标题置于底部条带
- 无封面：透明底，标题居中（`.project-card--bare`）
- 悬停：边框转 `var(--focus)`，标题转 `var(--heading)`
- `prefers-reduced-motion` 沿用全局兜底（过渡压至 .01ms）

### 6.3 视觉方向（三选一，已采用 A）

| 方向 | 描述 | 结论 |
|---|---|---|
| **A 收藏卡** | 封面铺满、标题压底、细边框、透明底兜底；克制的悬停描边 | **采用**，与全站「衬线正文 + 终端路径 + 克制紫」的编辑感一致 |
| B 杂志拼贴 | 不等高卡片、错落排布、强对比色块 | 否，与既有页面的安静气质冲突，且不等高会放大封面尺寸差异 |
| C 终端列表 | 等宽字体的行式条目，前缀图标 | 否，信息密度高但不满足「矩形区域嵌照片」的要求 |

## 7. 无障碍与降级

- 卡片整体是一个 `<a>`；封面图 `alt=""`（标题已传达语义，封面属装饰）
- 分区标题 `<h2>`，卡片标题 `<h3>`，层级连续
- 固定入口用 `<nav aria-label>` 包裹；外链加 `target="_blank" rel="noopener"`
- 封面图缺失不是错误状态，透明底 + 边框即可读
- 所有新增结构均为服务端渲染的静态 HTML，无 JS 依赖

## 8. 测试策略

- **单元**（`tests/unit/project-categories.test.ts`）：`category` 缺失报错、非法值报错、合法值通过；`groupByCategory` 顺序与空分区丢弃；中英标签齐全
- **单元**（更新 `tests/unit/content-schema.test.ts`）：既有项目断言补上 `category`
- **E2E**（新增 `tests/e2e/projects.spec.ts`）：五分区按固定顺序出现、卡片可点进详情、嵌套子页 200、宽版布局生效、入口链接指向正确
- **Fixtures**：`tests/fixtures/content/projects/{zh,en}/` 补 `_index.md`、五个分类各一例、以及一组带 `features` / `dev-log` 子页的嵌套项目

## 9. 兼容性与风险

| 风险 | 处置 |
|---|---|
| `z.enum(readonly tuple)` 在 Astro 内置 zod 上的兼容性 | 首次构建即验证；不兼容则退回字面量数组（语义等价） |
| `category` 必填会打破现有测试与内容 | 这正是 TDD 的 RED 起点；现有 `tests/unit/content-schema.test.ts` 与 fixture 同步更新 |
| 现有 `_placeholder.md` 缺少 `category` | 占位文件同步补字段（仍为 `draft: true`，不参与构建） |
| `cover` 走 `image()`，路径相对内容文件 | 文档写明相对路径写法；fixture 不设封面以规避测试期资源依赖 |
| catch-all 与 `index.astro` 并存 | 与 Notes 同构，静态路由优先，已验证可行 |

## 10. 明确不做

- 不改 Notes / Tips / Interests 的版式与结构
- 不引入任何前端框架或新依赖
- 不改动日期、草稿、双语回退等既有机制
- 不新增客户端 JS
