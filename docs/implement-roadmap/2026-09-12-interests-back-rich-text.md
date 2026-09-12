# 2026-09-12 Interests 卡片背面富文本 实施路线图

对应设计：[`docs/design/2026-09-12-interests-back-rich-text.md`](../design/2026-09-12-interests-back-rich-text.md)
对应测试文档：[`docs/testing-strategies/2026-09-12-rich-content-rendering.md`](../testing-strategies/2026-09-12-rich-content-rendering.md)
关联设计：[`docs/design/2026-09-10-interests-enhancement2.md`](../design/2026-09-10-interests-enhancement2.md) §10 开放项 1

> 状态：**实施中**。用户已于 2026-09-12 给出「批准设计…然后进行实现」的明确授权。
> 实施记录：`docs/records/2026-09-12-interests-back-rich-text.md`

---

## 授权与范围说明

| 项 | 内容 |
| --- | --- |
| 授权原话 | 「批准设计，完成roadmap，然后进行实现」 |
| 覆盖设计决策 | §3.1 `<template>` + `cloneNode`、§3.2 共享插件 + 独立处理器、§3.3 剥离原始 HTML、§3.4 图片走 `public/`、§3.5 背面公式/图片规则、§3.6 不改 schema 类型 |
| 覆盖面 | `cards[].body` 与 `heroImages[].body` **一起**（两者共用同一渲染函数） |
| 不在范围 | 背面代码块美化、编辑器、放宽 `body` 长度、改翻面交互 |

---

## 一个必须先解决的既有断言冲突（本路线图新增，设计文档未覆盖）

现有 E2E `tests/e2e/interests.spec.ts` 断言：

```
expect(overlay.locator('.interests-overlay__back-body').first()).toHaveText('Fixture 方形图的背面正文。')
```

而构建期编译产出的是裸 `<p>`，**不带** `interests-overlay__back-body` 类名。
若直接切换渲染路径，这条既有断言会失败，且 CSS 里
`.interests-overlay__back-body` 的间距规则也会一起失效。

**处置（本路线图采纳）**：新增一个小 rehype 插件，给**顶层段落**补上该类名。
理由：既保住既有断言与既有 CSS（零回归），又让类名在语义上仍然成立（它确实是背面正文段落）。
代价是插件多一个，但它与 §3.3 的 `rehypeStripRawHtml` 同属「构建期整理产物」这一类，职责清晰。

> 备选方案（改 CSS 选择器为 `[data-body] > p` 并同步改 E2E）被否：会把一次能力新增扩散成
> 「测试 + 样式 + 组件」三处连带改动，回归面更大。

---

## 阶段划分

### 阶段 0：核实（设计文档 §2.3 的「待核实」）

| # | 任务 | 结论 |
| --- | --- | --- |
| T0.1 | `InterestsCategoryPage.astro` 是否走 `ContentLayout` | ✅ **是**（第 11 行 import、第 66 行使用）→ 子页天然带 KaTeX 样式，无需另引 |
| T0.2 | `InterestsHome.astro` 是否走 `ContentLayout` | ✅ **是**（第 6 / 40 行）→ 大图背面同样有 KaTeX 样式 |
| T0.3 | `<img>` 是否会误命中模板内容 | ✅ 不会：`<template>` 的子节点在 `content` 文档片段里，**不是** button 的 DOM 后代，`button.querySelector('img')` 抓不到背面图 |

### 阶段 1：Markdown 处理器（可单测，先做）

| # | 任务 | 文件 | 验收 |
| --- | --- | --- | --- |
| T1.1 | 先写测试：七条编译期望（粗体 / 行内公式 / 独立公式 / 图片 / 列表 / `<script>` 被剥离 / `onclick` 与 `<div>` 被剥离） | `tests/unit/card-body.test.ts` | 先红：模块尚不存在 |
| T1.2 | 抽出共享插件数组 | `src/lib/markdown-shared.ts`（新建） | 导出 `remarkPlugins` / `rehypePlugins` |
| T1.3 | 剥离原始 HTML 的插件 | `src/plugins/rehype-strip-raw.ts`（新建） | 删除 HAST 里 `type === 'raw'` 的节点，**不作为文本保留** |
| T1.4 | 给顶层段落补 `interests-overlay__back-body` 类名 | 同上或同目录新文件 | 见上文「既有断言冲突」 |
| T1.5 | 单例处理器 + `renderCardBody()` | `src/lib/card-body.ts`（新建） | 模块级缓存，整个构建只创建一次 |
| T1.6 | 主处理器改从共享模块引入插件 | `astro.config.mjs` | 行为不变；`astro check` 0 错 |
| T1.7 | 单测转绿 | — | `vitest run` 全绿 |

**T1.6 为什么不能省**：不共享插件数组，就会出现「改了一处忘了另一处」的漂移——
主处理器与背面处理器的公式/提示块行为会不同步。

### 阶段 2：数据通道

| # | 任务 | 文件 | 说明 |
| --- | --- | --- | --- |
| T2.1 | frontmatter 里编译 body | `src/components/content/FlipCard.astro` | `const bodyHtml = await renderCardBody(body)` |
| T2.2 | 输出惰性模板 | 同上 | `<template data-body-rich set:html={bodyHtml}></template>` 放在 `<button>` 内部（`<template>` 属 phrasing content，规范允许） |
| T2.3 | `data-body` 属性保留不动 | 同上 | 作为纯文本回退数据源 |
| T2.4 | `open()` 改用 `cloneNode` | `public/scripts/interests.js` | `target.replaceChildren(tpl.content.cloneNode(true))` |
| T2.5 | 保留纯文本回退分支 | 同上 | 模板缺失时仍走 `renderBody()`，改造可单独回滚 |

**T2.4 不使用 `innerHTML` 的理由**：`cloneNode` 直接克隆已解析节点，不经过字符串 → HTML 解析器，
注入面由构建期插件白名单决定，而不是由内容字符串决定。这是对既有安全决定的**定向反转**，
边界必须落在代码里而不是文档里。

### 阶段 3：样式

| # | 任务 | 文件 | 规则 |
| --- | --- | --- | --- |
| T3.1 | 背面公式溢出保护 | `src/styles/interests.css` | `.katex-display { overflow-x: auto; overflow-y: hidden; padding: .5rem 0 }` |
| T3.2 | 背面图片 | 同上 | `img { max-width: 100%; height: auto }`（与 `prose.css` 正文图片一致） |
| T3.3 | 首段去上边距 | 同上 | `p:first-child { margin-top: 0 }` |
| T3.4 | 非段落块（列表 / 图片）的间距 | 同上 | 补 `ul`/`ol`/`img` 的上下间距，避免与段落规则打架 |

### 阶段 4：fixture

| # | 任务 | 文件 | 覆盖 |
| --- | --- | --- | --- |
| T4.1 | 某个类别加一张带富文本 `body` 的卡（中英各一） | `tests/fixtures/content/interests/{zh,en}/<类别>/_index.md` | P3：T4/T5/T6/T8 |
| T4.2 | 同一类别加一条带富文本的 `heroImages`（中英各一） | 同上 | **P4**：验证「改一处动两处」 |
| T4.3 | 背面图片复用既有 `/social/default.png` | 同上 | **刻意不新建图片**：`publicDir` 未覆盖，fixture 图放 `public/` 会被复制进 `dist/` 污染正式站点 |
| T4.4 | 重跑全量，确认卡片数量类断言未破 | — | 既有断言依赖各类别卡片数（如 8 张） |

### 阶段 5：测试与验收

| # | 任务 | 文件 |
| --- | --- | --- |
| T5.1 | E2E：翻面后存在 `.katex` 且文本可读 | `tests/e2e/interests.spec.ts` |
| T5.2 | E2E：`.katex-display` 在窄栏（504px）`scrollWidth > clientWidth` 时 `overflowX === 'auto'` | 同上 |
| T5.3 | E2E：背面 `<img>` 的 `naturalWidth > 0`（抓路径写错） | 同上 |
| T5.4 | E2E：**P4 大图背面**同样渲染富文本 | 同上 |
| T5.5 | E2E：移除模板后仍按纯文本分段（回退路径） | 同上 |
| T5.6 | E2E：关闭状态下模板内容不可见、不参与布局（`offsetHeight === 0`） | 同上 |
| T5.7 | E2E：既有断言全绿（段落文案、`tabindex`、`aria-label`、长文可滚动） | 同上 |
| T5.8 | 构建产物检索：页面 HTML 里背面内容**不含** `<script` 形式 | `dist/` 字符串检索 |
| T5.9 | 截图：窄栏内的图片 + 公式，浅色 + 深色各一张 | `tests/artifacts/2026-09-12-interests-back-rich-text/` |
| T5.10 | 记录文档 | `docs/records/2026-09-12-interests-back-rich-text.md` |

---

## 风险与对策

| 风险 | 对策 |
| --- | --- |
| 反转「不用 `innerHTML`」的既有决定 | 三重约束替代：构建期生成 + 剥离原始 HTML + 客户端不解析字符串；单测锁定 |
| `<template>` 放在 `<button>` 内的合法性 | 规范允许（phrasing content）；构建后用 HTML 结构断言 + E2E 交互双重确认 |
| 背面处理器与主处理器行为漂移 | 插件数组抽到 `markdown-shared.ts` 共享 |
| 既有 `.interests-overlay__back-body` 断言与样式失效 | 由 T1.4 的补类名插件兜住，见上文专节 |
| 图片路径写错只在运行时暴露 | E2E 断言 `naturalWidth > 0` |

---

## 不在本次范围

- 不做背面代码块高亮（68ch 窄栏体验差），只要求**不破版**。
- 不做编辑器 / 客户端渲染。
- 不放宽 `body` 的长度限制。
- 不改卡片正面、justified 布局、层叠方向、翻面交互。
