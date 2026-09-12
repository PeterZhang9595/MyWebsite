# 2026-09-12 项目卡片放大与富内容渲染 实施记录

来源需求：[`docs/requirements/2026-09-10-projects-enhancement3.md`](../requirements/2026-09-10-projects-enhancement3.md)、本轮对话追加的「代码块深色化 / 卡片背面富文本」
对应设计：[`docs/design/2026-09-10-projects-enhancement3.md`](../design/2026-09-10-projects-enhancement3.md)、[`docs/design/2026-09-12-interests-back-rich-text.md`](../design/2026-09-12-interests-back-rich-text.md)、[`docs/design/2026-09-12-prose-code-math-styling.md`](../design/2026-09-12-prose-code-math-styling.md)
对应路线图：[`docs/implement-roadmap/2026-09-10-projects-enhancement3.md`](../implement-roadmap/2026-09-10-projects-enhancement3.md)、[`docs/implement-roadmap/2026-09-12-interests-back-rich-text.md`](../implement-roadmap/2026-09-12-interests-back-rich-text.md)、[`docs/implement-roadmap/2026-09-12-prose-code-math-styling.md`](../implement-roadmap/2026-09-12-prose-code-math-styling.md)
测试策略：[`docs/testing-strategies/2026-09-12-rich-content-rendering.md`](../testing-strategies/2026-09-12-rich-content-rendering.md)
相关现状文档：[`docs/documents/content-authoring.md`](../documents/content-authoring.md)、[`docs/documents/visual-and-interaction-system.md`](../documents/visual-and-interaction-system.md)

> 用户于 2026-09-12 明确批准三份设计并指示「完成 roadmap，然后进行实现」后开始执行。

## 实现范围（三项）

### 1. Projects 卡片放大 + 副标题 + 封面 5:4

| 文件 | 变更 |
|---|---|
| `src/styles/prose.css` | `.project-grid` minmax 240→300（每行 4→3 张）；`.project-card` `aspect-ratio: 3/2 → 5/4`；原挂在标题上的底部信息条上移为 `.project-card__meta` 容器（标题 + 副标题共享同一块半透明底）；新增 `.project-card__subtitle`（`-webkit-line-clamp: 2` 截断）；bare 卡信息条改静态居中 |
| `src/lib/content-schema.ts` | project schema 新增可选 `subtitle: string`（空串视为未填，回退 `description`） |
| `src/lib/content-repository.ts` | `ContentItem.data` 增补 `subtitle` |
| `src/components/content/ProjectCard.astro` | 标题与副标题包进 `.project-card__meta`；副标题未填回退 `description`，为空串时不渲染 |

### 2. Interests 卡片背面富文本（图片 + 公式）

| 文件 | 变更 |
|---|---|
| `src/lib/markdown-shared.ts`（新） | 文章正文与卡片背面**共用**的 remark/rehype 插件数组，防漂移 |
| `src/lib/card-body.ts`（新） | 构建期把背面 Markdown 编译为 HTML（`createMarkdownProcessor`，关语法高亮，处理器模块级缓存） |
| `src/plugins/rehype-strip-raw.ts`（新） | 剥离背面正文中的原始 HTML（script/iframe/style 等），只留构建期生成的标签 |
| `src/plugins/rehype-tag-back-body.ts`（新） | 给背面根节点挂 `data-back-body` 标记，供样式作用域使用 |
| `src/plugins/rehype-base-relative-urls.ts`（新） | 给 `![](/foo.png)` 这类站点根相对地址补 `/MyWebsite` base（正文与背面共用，顺带修复了正文同类缺陷） |
| `astro.config.mjs` | markdown 配置改从 `markdown-shared.ts` 引入插件 |
| `src/components/content/FlipCard.astro` | 构建期编译 `body`，输出 `<template data-body-rich set:html>`；`data-body` 纯文本保留作回退 |
| `public/scripts/interests.js` | 首选 `template.content.cloneNode(true)`（不经过字符串→HTML 解析），无模板时回退纯文本段落渲染 |
| `src/styles/interests.css` | 背面滚动区补图片、`.katex-display` 横向滚动、列表等规则 |

**安全边界**（对既有「永不执行字符串里的标记」决定的定向反转，三重约束）：构建期生成 + 构建期剥离原始 HTML + 客户端只 cloneNode 不解析字符串。

### 3. 正文代码块深色化 + 公式样式

| 文件 | 变更 |
|---|---|
| `src/styles/prose.css` | 代码块去边框、padding 顶部加大；`--shiki-dark` 深色规则**去掉 `[data-theme='dark']` 前缀**（两套站内主题都渲染 VS Code 式深色块）；新增 `pre[data-language]::before` 语言标签（`data-language` 由 Astro 无条件写入，无需 transformer）；复制按钮换浅色配色、默认隐藏 hover/focus-within 显示；公式滚动区细滚动条 |
| `astro.config.mjs` | `shikiConfig.themes.dark: 'github-dark' → 'dark-plus'`（注释色对比度 3.05 → 5.0，唯一过 AA 4.5:1 的候选） |

## 实现期新增发现（设计文档未预见）

1. **正文 `![](/...)` 缺 base 是既有缺陷**：实现任务 2 时发现文章正文里站点根相对图片同样缺 `/MyWebsite` 前缀。已在共享插件 `rehype-base-relative-urls.ts` 一次修两处（正文 + 背面），含 6 条单测。
2. **预渲染 chunk 的裸标识符解析**：背面处理器把 `@astrojs/markdown-remark` 拉进预渲染 chunk，chunk 移到临时目录后裸 import 解析失败。`scripts/preload-tolerant-rm.cjs` 的解析钩子由「仅特判 sharp」扩为通用兜底：默认解析失败后以仓库根为父级重试一次。
3. **`import.meta.resolve` 在 register() 的钩子模块内不可用**（双参形式抛错），兜底只能用 `nextResolve(specifier, { ...context, parentURL: repoUrl })` 的覆盖重试，且必须在默认解析**失败之后**（先覆盖会破坏相对导入链）。

## 验证证据

测试级别：**Level 3（组件/数据/样式 + 构建配置变更）**，红绿 TDD（单测先红后绿）。

| # | 检查 | 结果 |
|---|---|---|
| 1 | 单测 + 集成：`node node_modules/vitest/vitest.mjs run` | **23 文件 114 用例全绿**（新增 `card-body.test.ts` 9 例、`base-relative-urls.test.ts` 6 例；`content-schema.test.ts` 扩至 13 例） |
| 2 | `node node_modules/astro/bin/astro.mjs check` | **0 errors / 0 warnings** |
| 3 | Chromium E2E：`node scripts/run-playwright.mjs --project=chromium` | **96/96 通过**（新增 `project-cards.spec.ts` 4 例、`prose-styling.spec.ts` 6 例、`interests-back-rich.spec.ts` 3 例） |
| 4 | 生产构建（正式内容） | **通过**，39 页全部生成 |
| 5 | 正式页面无代码块/公式 | `dist/**/*.html` 检索 `astro-code`/`katex-display` **零命中** —— 深色块改动对当前真实内容零可见影响；新 CSS 规则已在产物样式表内 |
| 6 | E2E 关键几何/对比度断言 | 网格恰好 3 轨道、全部卡片宽高比 1.25±0.02、可见封面高 >170px、语言标签/复制按钮对比度 ≥4.5:1（AA）、「计算值 ≠ 内联值」双断言 |

截图存于 `tests/artifacts/2026-09-12-rich-content-impl/`（gitignore 产物）：`projects-cards-54-light.png`、`rich-content-code-dark-block-light-theme.png`、`rich-content-code-dark-theme.png`、`interests-back-rich-text.png`。

## 补充交付（同日 16:44，用户检查内容维护文档时发现）

设计 §5.1 承诺的「删除与下线内容」一节在首轮实现中被遗漏，已补进
`content-authoring.md` 新 §16（下线 ≠ 删除、各栏目删除要点表、删除后核对清单、YAML 引号提醒）；
§10 末尾错放的图片 base 规则也已按设计 §5.3 移到 §11「图片与媒体」并补链接类地址同样补 base 的说明。

## 未触碰的内容

- 正式内容文件一字未改（fixture 新增内容全部在 `tests/fixtures/content/`）；
- Git：未执行任何 Git 操作，改动待用户审阅 `git status` / `git diff` 后自行提交；
- 部署配置、CI、依赖清单均未动（零新增 npm 依赖）。

## 已知限制与后续事项

- `dist/` 因 `emptyOutDir: false` 保留了上一轮构建的旧 hash 产物（ unreferenced，无害但会累积）；正式部署前建议清空 `dist/` 重建一次。
- 背面图片约定走 `public/` 绝对路径（经 base 插件补前缀），不经过 Astro 图片优化 —— 这是已批准的设计取舍（设计文档 §4.6）。
- 触屏设备上复制按钮无 hover 的行为（测试策略 §9 遗留项 #9）仍未实测，需要真机验证。
- 正文图片走相对路径（与 `.md` 同目录）仍由 Astro 优化；只有 `/` 开头的站点绝对路径才补 base。
