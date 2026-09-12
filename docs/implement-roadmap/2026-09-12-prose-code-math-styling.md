# 2026-09-12 正文代码与公式样式 + 内容维护文档整理 实施路线图

对应设计：[`docs/design/2026-09-12-prose-code-math-styling.md`](../design/2026-09-12-prose-code-math-styling.md)
对应测试文档：[`docs/testing-strategies/2026-09-12-rich-content-rendering.md`](../testing-strategies/2026-09-12-rich-content-rendering.md)

> 状态：**实施中**。用户已于 2026-09-12 给出「批准设计…然后进行实现」的明确授权。
> 实施记录：`docs/records/2026-09-12-prose-code-math-styling.md`

---

## 授权与范围说明

| 项 | 内容 |
| --- | --- |
| 授权原话 | 「批准设计，完成roadmap，然后进行实现」 |
| 覆盖设计决策 | §4.1 深色块去边框、§4.1.2 主题名改 `dark-plus`、§4.2 语言标签纯 CSS 伪元素、§4.3 复制按钮 hover 才现、§4.4 公式细滚动条、§4.7 标签与按钮换浅色、§5 内容维护文档整理 |
| 关键前提（设计 §3.3 已核对） | `data-language` **由 Astro 无条件写入** → **不需要自定义 transformer** |
| 不在范围 | 不新增依赖（Expressive Code / highlight.js / MathJax 均不引入）；不做标题栏 / 行号 / 折叠 / 公式编号；不改行内代码配色；不给亮色主题保留浅色代码块 |

---

## 阶段划分

### 阶段 0：定位确认（无代码改动）

| # | 任务 | 说明 |
| --- | --- | --- |
| T0.1 | 确认 `prose.css` 第 46–49 行仍是目标规则（第 46 `pre`、47 深色作用域、48 `.code-copy`、49 行内码、56 `katex-display`） | 行号漂移时按语义定位 |
| T0.2 | 确认 `astro.config.mjs` 第 46 行仍为 `{ light: 'github-light', dark: 'github-dark' }` | — |
| T0.3 | 确认复制按钮由 `ContentLayout.astro` 第 11 行内联脚本注入、文案为 `Copy` / `Copied` / `Unavailable` | **脚本不改**，只改 CSS 可见性与配色 |

### 阶段 1：配置（一个词）

| # | 任务 | 文件 | 改前 → 改后 |
| --- | --- | --- | --- |
| T1.1 | 深色档主题 | `astro.config.mjs` 第 46 行 | `dark: 'github-dark'` → `dark: 'dark-plus'` |

**为什么保留双主题结构**（而不是直接写 `theme: 'dark-plus'`）：双主题让 `--shiki-dark` 变量继续存在，
将来若想把亮色主题改回浅色代码块，只需把 CSS 里的 `[data-theme='dark']` 加回去，不必改配置。

### 阶段 2：代码块

| # | 任务 | 文件 | 规则 |
| --- | --- | --- | --- |
| T2.1 | 两套主题都用深色：**去掉 `[data-theme='dark']` 前缀** | `src/styles/prose.css` 第 47 行 | `.astro-code, .astro-code span { color: var(--shiki-dark) !important }`；`.astro-code { background-color: var(--shiki-dark-bg) !important }` |
| T2.2 | 去边框、顶部留出标签与按钮的位置 | 同上 第 46 行 | `border: 0`；`padding: 2.35rem 1rem 1rem`；**刻意不写 `background`** |
| T2.3 | 语言标签（纯 CSS 伪元素） | 同上 新增 | `.prose pre[data-language]::before { content: attr(data-language) }`，固定左上角 |

**T2.1 的 `!important` 不可省**：Shiki 把浅色主题写在 `<pre>` 的**内联** `style` 上，
只有样式表的 `!important` 能压过去。设计期预验证已实证：内联仍是 `#fff`、计算值是深色。
**也因此：验证时必须读 `getComputedStyle`，读 `el.style.*` 会得出「没生效」的错误结论。**

### 阶段 3：复制按钮与连带配色（最易漏）

| # | 任务 | 文件 | 改后值 | 依据 |
| --- | --- | --- | --- | --- |
| T3.1 | 语言标签换浅色 | `src/styles/prose.css` | `color: rgba(255, 255, 255, .62)` | 沿用 `var(--muted)`（`#2a2a2a`）在 `#1e1e1e` 上仅 **1.16:1**，改后 **16.67:1** |
| T3.2 | 复制按钮换浅色 | 同上 | `color: rgba(255,255,255,.78)`、`background: rgba(255,255,255,.09)`、`border-color: rgba(255,255,255,.22)` | 原为 `color: var(--muted)` + `background: var(--bg)`，在深色块上是一块白斑 |
| T3.3 | hover / 键盘聚焦才出现 | 同上 | `.code-copy { opacity: 0; transition: opacity .15s ease }`；`pre:hover` 与 `pre:focus-within` 置 1 | `:focus-within` 必需，否则键盘用户永远看不到按钮 |

> **T3.1–T3.3 必须与 T2.1 同一批完成。** 只改底色会导致标签消失、按钮变白斑，
> 而这两处都不会被「代码块变深了没有」这类断言捕获。

### 阶段 4：公式

| # | 任务 | 文件 | 规则 |
| --- | --- | --- | --- |
| T4.1 | 细滚动条 | `src/styles/prose.css` 第 56 行 | 补 `scrollbar-width: thin` 与 `::-webkit-scrollbar` 两条 |
| T4.2 | 保留溢出保护 | 同上 | `overflow-x: auto`、`overflow-y: hidden` **不改**（`overflow-y: hidden` 必须写，否则某些字体度量下会多出纵向滚动条） |

### 阶段 5：fixture

| # | 任务 | 文件 | 承载类型 |
| --- | --- | --- | --- |
| T5.1 | 新增富内容笔记 fixture（中英各一） | `tests/fixtures/content/notes/{zh,en}/rich-content.md` | T1 行内码、T2 代码块、T3 超长单行、T4 行内公式、T5 独立公式、T6 超宽公式、T8 基础语法 |
| T5.2 | 新增富内容项目 fixture（中英各一） | `tests/fixtures/content/projects/{zh,en}/rich-content.md` | 同上（验证 Projects 页不是特例）；**该文件同时是 Projects 任务的 `subtitle` fixture，两个任务共用一份，不重复创建** |
| T5.3 | P1 的 fixture 图片放在 md 文件**旁边**用相对路径 | `tests/fixtures/content/notes/{zh,en}/rich-content-image.png` | 走 Vite 处理 |
| T5.4 | 重跑全量，确认新增条目未打破既有断言 | — | fixture 归入无计数断言的分类 |

**T5.3 为什么必须放文件旁边**：`astro.config.mjs` 未覆盖 `publicDir`，
fixture 构建与生产构建共用仓库根的 `public/` → 放 `public/` 会被复制进 `dist/`，污染正式站点。

### 阶段 6：内容维护文档整理（`docs/documents/content-authoring.md`）

| # | 任务 | 说明 |
| --- | --- | --- |
| T6.1 | 新增「删除与下线内容」一节（当前完全缺失） | 逐栏目给出删除步骤与副作用；附「增删检查清单」（双语配对、每级 `_index.md`、slug 与文件夹一致、YAML 引号陷阱、构建后核对 404 与搜索） |
| T6.2 | 重写 §10（Markdown / 代码 / 提示块 / 数学） | 说明**亮色主题下代码块也是深色块**、语言标签、复制按钮 hover、长行横向滚动不折行、公式溢出滚动；并明确「行内代码仍是红棕」 |
| T6.3 | 重写 §11（图片与媒体） | 写清两条路径分工：需 Astro 优化的图走 `src/assets/` 相对路径；需稳定原始 URL 的走 `public/` 绝对路径 |
| T6.4 | 接入 Interests 背面富文本写法 | 内容归 `interests-back-rich-text` 设计，结构归本次重构，不重复劳动 |
| T6.5 | 同步 `docs/documents/visual-and-interaction-system.md` | 代码块与公式的现状描述 |

### 阶段 7：测试与验收

| # | 任务 | 文件 |
| --- | --- | --- |
| T7.1 | E2E：浅色站内主题下代码块计算背景**不等于** `--bg`、也不等于 `--surface`，且亮度低于 `--surface` | `tests/e2e/prose-styling.spec.ts`（新建） |
| T7.2 | E2E：`pre.style.backgroundColor`（内联，仍是浅色）与计算背景色**不相等**——两者一起断言 | 同上 |
| T7.3 | E2E：浅色与深色各测一次 `borderTopWidth === '0px'` | 同上 |
| T7.4 | E2E：`data-language` 存在且 `pre::before` 的 `content` 等于语言名 | 同上 |
| T7.5 | E2E：`pre::before` 的颜色与块底色对比度 **≥ 4.5:1** | 同上 |
| T7.6 | E2E：复制按钮前景 / 背景对比度 **≥ 4.5:1**，且背景不是 `--bg` 的浅色 | 同上 |
| T7.7 | E2E：复制按钮 `opacity` `0 → 1`（hover 与键盘聚焦两条路径）；**读值前等过渡结束** | 同上 |
| T7.8 | E2E：超长单行 `scrollWidth > clientWidth` 且 `whiteSpace !== 'pre-wrap'`（容器约束到正文真实宽度 72ch） | 同上 |
| T7.9 | E2E：超宽公式 `scrollWidth > clientWidth` 时 `overflowX === 'auto'`、`overflowY === 'hidden'` | 同上 |
| T7.10 | E2E：axe 无障碍扫描通过 | `tests/e2e/accessibility.spec.ts`（回归） |
| T7.11 | **「正式页面影响为零」的证据**：生产构建后检索 `dist/**/*.html`，代码块与公式数量与改前一致（当前为 0） | 交付报告 |
| T7.12 | 截图：代码块特写（含 hover 态）、公式特写（含超宽）、浅深各一套 | `tests/artifacts/2026-09-12-prose-code-math-styling/` |
| T7.13 | 记录文档 | `docs/records/2026-09-12-prose-code-math-styling.md` |

---

## 风险与对策

| 风险 | 对策 |
| --- | --- |
| 注释等低彩度 token 在深色块上对比度不足 | 三候选已量化：`github-dark` 3.05:1、`one-dark-pro` 3.73:1 均低于 AA 4.5:1；选定 `dark-plus` 5.0:1。列为断言 |
| 语言标签 / 复制按钮沿用旧配色后失效 | T3.1–T3.3 与 T2.1 同批改；T7.5 / T7.6 为强制断言。**只改底色不改这两处是最可能的漏改路径** |
| 触屏下无 hover，按钮可能不可达 | `:focus-within` 保底；触屏实测不可用则改为「默认可见、窄屏常驻」，属追加改动 |
| 判断「深色块是否生效」被截图误导 | 已实际发生一次（截图看错，取像素后证伪）。颜色一律读计算值或采样像素 |
| 语言标签高度与预留 `padding-top` 不匹配 | 实现后按截图微调 `padding-top` 并记录最终值 |
| fixture 图片污染正式站点 | P1 图放 md 文件旁边走 Vite；背面图复用 `/social/default.png` |

---

## 不在本次范围

- 不新增任何依赖（不引入 Expressive Code、highlight.js、MathJax）。
- 不做代码块标题栏、行号、行高亮、折叠、代码分组标签页。
- 不做公式编号 / 交叉引用。
- 不往正式内容里塞示例文章——示例只进 fixture。
- 不给亮色主题保留浅色代码块（不做分叉）。
- 不改行内代码配色（仍是红棕 `#a23625` / `#ee9182`）。
