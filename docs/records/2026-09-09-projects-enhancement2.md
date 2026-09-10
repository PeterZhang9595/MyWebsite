# 2026-09-09 Projects 视觉增强二轮 实施记录

对应需求：[`2026-09-09-projects-enhancement2.md`](../requirements/2026-09-09-projects-enhancement2.md)
对应设计：[`2026-09-09-projects-enhancement2.md`](../design/2026-09-09-projects-enhancement2.md)
对应路线：[`2026-09-09-projects-enhancement2.md`](../implement-roadmap/2026-09-09-projects-enhancement2.md)

## 背景

在一轮 Projects 增强（分区卡片墙 + 无限层 + 固定入口）已落地的基础上，对 projects 栏目做一轮**视觉与信息表达**迭代：

1. 卡片悬停由「边框转紫」改为「整卡降饱和 + 标题变灰」；
2. 项目栏目首页新增 antfu 风格的**散点背景氛围层**；
3. 详情页三态波纹状态灯 + 目录卡片状态角标；技术栈带 Simple Icons 内联 SVG 图标；
4. 五个分类分区可容纳无限子项目（验证既有架构可扩展性）。

## 变更清单

### 代码（11）

| 文件 | 改动 |
|---|---|
| `src/styles/tokens.css` | 加 `--status-active/completed/archived` 深浅两套令牌 |
| `src/styles/prose.css` | hover 变灰取代紫边；新增 `.project-status`、`.project-atmosphere*`、`.status-ripple*`、`.project-tech*`、`.project-section` 定位/层级 |
| `src/lib/project-categories.ts` | 加 `projectStatuses`、`isProjectStatus`、`projectStatusLabels`、`projectStatusLabel` |
| `src/data/tech-icons.ts` | **新建**：收录 Go/Python/TypeScript/Astro/PyTorch 的 Simple Icons 官方 SVG path，含 `techIconFor` 大小写/空白不敏感查找 |
| `src/components/content/ProjectCard.astro` | 加 `.project-status` 角标（status 三色） |
| `src/components/content/ProjectAtmosphere.astro` | **新建**：固定种子伪随机散布 46 个 1–3px 圆点，静态 HTML |
| `src/components/content/ProjectStatus.astro` | **新建**：波纹状态灯 + 可选文字标签 |
| `src/components/content/TechStack.astro` | **新建**：技术栈带图标/无图标回退 |
| `src/components/pages/ProjectSectionIndex.astro` | 接 `ProjectAtmosphere`、包 `.project-section` + `__body` |
| `src/components/pages/ContentItemPage.astro` | facts 改用 `ProjectStatus` + `TechStack`；导入状态标签工具 |

### 测试（3）

| 文件 | 改动 |
|---|---|
| `tests/unit/tech-icons.test.ts` | **新建**：6 例覆盖收录范围、合法键、case-insensitive、回退、字段类型 |
| `tests/unit/project-categories.test.ts` | 未改（project-categories 现有断言已覆盖 `groupByCategory`；新增的 status 工具通过 E2E 间接验证） |
| `tests/e2e/projects.spec.ts` | 新增 8 个用例：角标三色、hover 变灰、散点层、active/completed/archived 三态波纹、tech svg、动态扩展 |

### Fixtures（2）

| 文件 | 改动 |
|---|---|
| `tests/fixtures/content/projects/zh/legacy-tool.md` | **新建**：archived + tech=Python，覆盖已归档波纹与 Python 图标 |
| `tests/fixtures/content/projects/en/legacy-tool.md` | **新建**：同上英文 |

### 文档（4）

| 文件 | 改动 |
|---|---|
| `docs/design/2026-09-09-projects-enhancement2.md` | **新建**：设计文档，已批准 |
| `docs/implement-roadmap/2026-09-09-projects-enhancement2.md` | **新建**：实施路线图（T1–T4） |
| `docs/documents/content-authoring.md` | §7.6 新增「视觉表达」一节；§3.1 文档化的旧 hover 紫边以新决策为准 |
| `docs/records/2026-09-09-projects-enhancement2.md` | **新建**（本文件） |

### 内容占位

未新增/删除真实占位内容（沿用增强一轮留下的 5 卡 + 1 大项目）；测试 fixture 新增 legacy-tool 让三态波纹可在 CI 中独立断言。

## 验证结果

| 检查 | 结果 |
|---|---|
| `pnpm run check`（astro check） | 0 errors / 0 warnings / 0 hints（102 files） |
| `pnpm test:unit`（vitest） | **52 passed** / 17 files（含新增 tech-icons 6 例） |
| `pnpm run build`（含 Pagefind） | 27 pages built |
| Playwright Chromium（projects.spec.ts） | **16/16 passed**（含一轮 8 个 + 二轮新增 8 个） |
| 截图（fixture 内容） | `tests/artifacts/2026-09-09-projects-v2/` 4 张：home、hover-grey、large-active-status、completed-green-status |

### E2E 截图（验收用）

- `projects-home.png`：项目首页散点 + 5 分区卡片墙 + 三色状态角标
- `projects-hover-grey.png`：卡片悬停整卡降饱和、标题变灰（非紫边）
- `large-active-status.png`：详情页 active 蓝色波纹 + Astro 图标 + 4 个固定入口
- `completed-green-status.png`：单页项目已完成绿色波纹

## 决策与歧义记录

| 议题 | 处置 |
|---|---|
| lucide 实测无任何品牌图标（github/typescript/react/python/git 全部缺失） | 不依赖 lucide；新建 `src/data/tech-icons.ts` 收录 Simple Icons 官方 SVG path |
| Simple Icons 包 unpacked ~16MB，整包引入违反克制依赖 | 仅按需收录 5 个技术，文件 ~5KB，构建期内联 |
| 新版 Simple Icons SVG 不带 hex fill | `TechIcon.hex` 字段保留，填入官方公开品牌色（Python 3776AB、Go 00ADD8、TypeScript 3178C6、Astro BC52EE、PyTorch EE4C2C）；实际渲染用 `currentColor` 与站点文本色统一 |
| `ui.ts` 是否加 status 词条 | 否——避免给 `UiKey` enum 加耦合字段；status 标签集中于 `project-categories.ts` |
| 三态波纹在目录页（`isProjectDirectory`）也显示 | 是——大型项目根目录页同样有 status，让用户一眼看到状态，符合「每个子项目页面用波纹包装」 |
| 一轮设计 §6.2「hover 紫边」与本轮 hover 变灰冲突 | 按设计 §3.1 明确记录为迭代修正；content-authoring §7.6 已注明 |

## Git 提醒

本轮变更 + 一轮变更 + 09-07 superpowers 兼容变更**均未提交**（按项目规则未经用户授权不执行任何 git 操作）。建议拆三条 commit：

```text
# 1. docs: adopt Superpowers methodology with project authorization constraints
.gitignore  AGENTS.md  docs/development/strategy.md
docs/testing-strategies/2026-09-03-testing-strategy.md
docs/records/2026-09-07-superpowers-compatibility.md

# 2. feat(projects): grouped card wall, category field, nested routes, fixed entries
（一轮全部新增/修改文件，详见
 docs/records/2026-09-09-projects-enhancement.md）

# 3. feat(projects): status ripple, tech icons, atmosphere layer, hover grey
（本轮全部新增/修改文件，含本记录文档）
```

## 已知约束

- 仅 Chromium 与 WebKit 可用；Firefox 在本机仍报 `spawn UNKNOWN`。本轮 E2E 仅 chromium 验证（项目默认测试通道）。
- Simple Icons 收录范围需随真实项目 `technologies` 扩展；新增技术时请把对应 SVG path 抄进 `src/data/tech-icons.ts` 并注明许可来源（ISC）。

## 未做

- Notes / Tips / Interests 版式不动；
- 卡片墙到 antfu 式长列表布局不动；
- 进度百分比波纹不做（无进度字段）；
- Simple Icons 整包引入不做。