# Interests 卡片背面富文本（图片与公式）设计

## 文档状态

- 类型：设计文档（派生自用户于 2026-09-12 提出的需求，并落实
  `docs/requirements/2026-09-10-interests-enhancement2.md` 第 3 行的原始诉求）
- 日期 / 主题：2026-09-12 / interests-back-rich-text
- 状态：**草案，待用户批准**。批准前不进入实现。
- 关联文档：`docs/design/2026-09-10-interests-enhancement2.md`（§10 开放项 1、
  §10 开放项 2 明确把「背面富文本」判为独立需求）、
  `docs/design/2026-09-10-interests-card-wall.md`（卡片墙一期）。
- 测试文档：`docs/testing-strategies/2026-09-12-rich-content-rendering.md`（位置 × 内容类型测试矩阵）。

## 1. 需求与澄清结论

需求：**卡片背面支持富文本，包括图片和数学公式，并在测试中验证**。

| 决策点 | 结论（2026-09-12 与用户确认） |
| --- | --- |
| 渲染时机 | **构建期编译 Markdown 为 HTML**，客户端不做 Markdown/公式解析 |
| 安全边界 | **禁用原始 HTML**。作者只能用 Markdown 语法，HTML 全部由构建期生成 |
| 图片路径 | 图片放 `public/`，正文里写站点绝对路径（如 `/media/interests/x.png`） |
| 支持范围 | 强调 / 链接 / 列表 / 图片 / 行内公式 / 独立公式 |
| 覆盖范围 | `cards[].body` 与 `heroImages[].body` **一起覆盖**（两者共用同一渲染函数） |
| 技术栈 | 沿用现有 `remark-math` + `rehype-katex`，**不新增依赖** |

## 2. 现状与关键约束

### 2.1 数据与渲染链路

| 环节 | 现状 |
| --- | --- |
| 字段 | `cards[].body`（必填字符串，`z.string().trim().min(1)`），`src/lib/content-schema.ts` 第 69 行 |
| 传递 | `FlipCard.astro` 第 55 行把 body 放进按钮的 `data-body` 属性 |
| 渲染 | `public/scripts/interests.js` 第 86–98 行 `renderBody()` 用 **`textContent`** 按空行切段 → 多个 `<p class="interests-overlay__back-body">` |
| 调用点 | `interests.js` 第 127 行，唯一一处，服务浮层的背面区域 |

### 2.2 必须面对的既有设计意图

`interests.js` 第 80–85 行的注释写得很明确：

> 只用 `textContent` 赋值，不碰 `innerHTML` —— 内容虽来自本站自有 md，
> 但保持「永不执行字符串里的标记」这条底线，避免后续接编辑器时留下注入面。

**本次需求是对这条决定的定向反转。** 反转的边界是：
仍然不把「任意字符串」交给客户端解析——客户端拿到的必须是**构建期已经生成好的 HTML**，
且该 HTML 经过「剥离所有原始 HTML 节点」的强制过滤。这样注入面不增加：
能进 DOM 的标签集合由构建期插件白名单决定，而不是由内容字符串决定。

### 2.3 已就绪的能力（本次不需要新建）

- `astro.config.mjs` 第 39–49 行已配置 `remark-math` + `rehype-katex` + `remarkCallouts`，
  走 `@astrojs/markdown-remark` 的 `unified({...})`（该导出是同步返回的处理器）；
- `prose.css` 第 1 行已 `@import 'katex/dist/katex.min.css'`；
- KaTeX 字体已在构建产物中（`dist/` 内含 19 个 woff2），接入背面**不增加字体体积**；
- Interests 页面经 `ContentLayout` 渲染（`InterestsHome.astro` 第 6 行），
  而 `ContentLayout.astro` 第 2 行正是引入 `prose.css` 的位置，因此 KaTeX 样式天然可用。
  **待核实**：`InterestsCategoryPage.astro` 是否同样走 `ContentLayout`（实现阶段第一步确认）。

## 3. 设计决策

### 3.1 数据通道：`<template>` 承载构建期 HTML，客户端 `cloneNode`

不使用 `innerHTML`。改为在卡片里放一个惰性模板，脚本克隆其内容：

```astro
<!-- FlipCard.astro：新增，放在 button 内部（<template> 属 phrasing content，允许） -->
<template data-body-rich set:html={bodyHtml}></template>
```

```js
// interests.js：open(source) 内替换第 127 行
var tpl = source.querySelector('template[data-body-rich]');
var target = overlay.querySelector('[data-body]');
if (tpl) {
  target.replaceChildren(tpl.content.cloneNode(true));
} else {
  renderBody(target, source.dataset.body || '');   // 保留纯文本回退
}
```

三点收益：

1. **没有 `innerHTML`**：`cloneNode` 直接克隆已解析好的节点，不经过字符串 → HTML 解析器；
2. **回退安全**：模板缺失时退回现有纯文本路径，改造可分步、可单独回滚；
3. **不进搜索索引**：`<template>` 的内容是惰性的，Pagefind 不会把 12 张卡的正文
   重复索引进搜索结果——这一点与现状（body 只存在于 data 属性里，不被索引）行为一致。

`data-body` 属性**保留不动**，作为回退数据源。代价是 HTML 里同时存在 Markdown 原文与编译结果，
但正文体量很小，收益（可回退）大于代价。

### 3.2 Markdown 处理器：共享配置 + 独立实例

不能直接复用 Astro 主处理器，因为「剥离原始 HTML」这条约束**只应作用于卡片背面**，
不应改变文章正文的既有行为。因此：

```
新增 src/lib/markdown-shared.ts
  export const remarkPlugins = [remarkMath, remarkCallouts];
  export const rehypePlugins = [rehypeKatex];

astro.config.mjs → import { remarkPlugins, rehypePlugins } from './src/lib/markdown-shared.ts'
src/lib/card-body.ts → unified({ remarkPlugins, rehypePlugins: [...rehypePlugins, rehypeStripRawHtml] })
```

- **配置共享**：主处理器与背面处理器读同一份插件数组，避免「改了一处忘了另一处」的漂移；
- **实例独立**：背面处理器额外挂 `rehypeStripRawHtml`（新增的小插件，见 §3.3）；
- **单例缓存**：`card-body.ts` 用模块级变量缓存处理器实例，整个构建只创建一次。

新增 `src/lib/card-body.ts`：

```ts
let processor = null;
export async function renderCardBody(markdown) {
  processor ??= unified({ remarkPlugins, rehypePlugins: [...rehypePlugins, rehypeStripRawHtml] });
  const { code } = await processor.render(markdown);
  return code;
}
```

`FlipCard.astro` 在 frontmatter 里 `const bodyHtml = await renderCardBody(body);`。

### 3.3 禁用原始 HTML 的强制手段

新增 `src/plugins/rehype-strip-raw.ts`：遍历 HAST，删除 `type === 'raw'` 的节点
（CommonMark 会把 `<script>`、`<div>` 这类原始 HTML 解析成 `raw` 节点）。
被删掉的原始 HTML **不作为文本保留**，避免出现「代码里出现了尖括号但没生效」的困惑。

这条约束由单元测试直接覆盖（§6.1），而不是靠文档约定。

### 3.4 图片路径约定

- 写法：`![替代文字](/media/interests/xxx.png)`
- 图片文件放 `public/media/interests/`，构建时原样拷贝，**不经过 `astro:assets` 优化**。
- 理由：`cards[].body` 是 frontmatter 里的字符串，没有文件相对路径上下文，
  无法可靠地解析相对路径并交给 `astro:assets`。走 `public/` 是路径语义唯一无歧义的方案。
- 代价（已知并接受）：不自动压缩、不生成多尺寸、不防布局抖动。
  因此**卡片正面主图仍走已有的 `image` 字段**（`image()` helper，有优化），
  两者分工写进内容维护文档，避免混用。
- 图片样式：`.interests-overlay__back-scroll img { max-width: 100%; height: auto; }`，
  与 `prose.css` 第 45 行的正文图片规则保持一致。
- **测试纪律（2026-09-12 补充发现）**：`astro.config.mjs` 未覆盖 `publicDir`，
  fixture 构建与生产构建**共用仓库根的 `public/`**。因此测试图片**不得放进
  `public/media/interests/`** —— 它会被复制进 `dist/`，测试素材污染正式站点，
  而这里恰好就是本设计选定的图片目录。E2E 改为复用既有资源 `/social/default.png`
  来验证「站点绝对路径能加载」。详见
  `docs/testing-strategies/2026-09-12-rich-content-rendering.md` §7.2。

### 3.5 公式样式

复用 `prose.css` 已有的 KaTeX 引入，在背面作用域补三条：

```css
.interests-overlay__back-scroll .katex-display { overflow-x: auto; overflow-y: hidden; padding: .5rem 0; }
.interests-overlay__back-scroll img { max-width: 100%; height: auto; }
.interests-overlay__back-scroll p:first-child { margin-top: 0; }
```

浮层背面是窄栏（`interests.css` 第 195 行 `max-width: 68ch`），
独立公式必须横向可滚，否则会撑破浮层——这正是 KaTeX 官方文档给出的标准做法。

### 3.6 schema

`body` 字段**不改变类型**（仍是必填字符串）。变化只在语义与文档：

- `src/lib/content-schema.ts` 第 69 行加注释说明 `body` 支持 Markdown 子集与公式语法；
- 不新增字段，因此**存量内容不需要迁移**，12 张卡现有纯文本继续正常渲染。

## 4. 涉及文件

| 文件 | 改动 |
| --- | --- |
| `src/lib/markdown-shared.ts` | 新增，抽出共享插件数组 |
| `src/lib/card-body.ts` | 新增，单例处理器 + `renderCardBody()` |
| `src/plugins/rehype-strip-raw.ts` | 新增，剥离原始 HTML 节点 |
| `astro.config.mjs` | 插件数组改为从 `markdown-shared.ts` 引入 |
| `src/components/content/FlipCard.astro` | 编译 body，输出 `<template data-body-rich>` |
| `public/scripts/interests.js` | `open()` 改用 `cloneNode`，保留纯文本回退 |
| `src/styles/interests.css` | 背面作用域的公式 / 图片 / 段落规则 |
| `src/lib/content-schema.ts` | `body` 字段注释（无类型变更） |
| `tests/unit/card-body.test.ts` | 新增，覆盖编译结果与 HTML 剥离 |
| `tests/unit/content-schema.test.ts` | 补 `body` 语义用例 |
| `tests/e2e/interests.spec.ts` | 背面公式 / 图片 / 回退的端到端断言 |
| `tests/fixtures/content/interests/**` | 补一张带公式与图片的背面 fixture |
| `docs/documents/content-authoring.md` | §8 Interests 补背面富文本写法 |
| `docs/documents/website-architecture.md` | 记录新增的 Markdown 处理链路 |

## 5. 非目标

- 不做卡片背面的代码块高亮（背面宽度只有 68ch，代码块体验差；若内容里出现围栏代码，
  只要求不破坏布局，不做专门美化）。
- 不做编辑器 / 客户端渲染（`docs/requirements/2026-09-03-edit-tools-development.md` 另议）。
- 不放宽 `body` 的长度限制。
- 不改卡片正面、justified 布局、层叠方向、翻面交互。

## 6. 验证方式

### 6.1 单元测试（新建 `tests/unit/card-body.test.ts`）

直接对 `renderCardBody()` 断言，这是本次风险最集中的地方：

| 输入 | 期望 |
| --- | --- |
| `**粗体**` | 输出含 `<strong>` |
| `$E = mc^2$` | 输出含 `class="katex"` |
| `$$\nabla_\theta J(\theta)$$` | 输出含 `class="katex-display"` |
| `![图](/media/interests/a.png)` | 输出含 `<img` 且 `src="/media/interests/a.png"`、`alt="图"` |
| `- 一` / `- 二` | 输出含 `<ul>` 与两个 `<li>` |
| `<script>alert(1)</script>` | 输出**不含** `<script`，也不含 `alert(1)` 文本 |
| `<div onclick="x()">t</div>` | 输出**不含** `onclick`，且不含 `<div` |

### 6.2 端到端（`tests/e2e/interests.spec.ts`）

1. 打开带公式的卡片 → 浮层背面存在 `.katex` 且文本可读；
2. 打开带独立公式的卡片 → 存在 `.katex-display`，且其 `scrollWidth > clientWidth` 时
   `overflow-x` 为 `auto`（窄栏溢出保护生效）；
3. 打开带图片的卡片 → 背面存在 `<img>`，且 `naturalWidth > 0`（图片真的加载成功，
   而不是只渲染了标签——这条能抓到路径写错的情况）；
4. **回退路径**：模板被移除时仍按纯文本分段渲染（可用既有纯文本卡验证）；
5. **既有断言全绿**：`.interests-overlay__back-body` 段落数、滚动容器
   `tabindex` 与 `aria-label`、长文可滚动等现有用例不得回归；
6. 关闭状态下 `<template>` 内容**不可见、不参与布局**（`offsetHeight === 0`）。

### 6.3 全量回归

Chromium 端到端全量 + `astro check` + 生产构建，并在构建产物里确认
`interests` 页面 HTML 中不含 `<script` 形式的背面内容。

## 7. 风险

| 风险 | 处置 |
| --- | --- |
| 反转了「不用 innerHTML」的既有决定 | 用「构建期生成 + 原始 HTML 剥离 + 禁止字符串解析」三重约束替代，并由单测锁定 |
| `<template>` 放在 `<button>` 内的合法性 | `<template>` 属 phrasing content，规范允许；实现后由 HTML 校验与 E2E 双重确认 |
| 背面处理器与主处理器行为漂移 | 插件数组抽到 `markdown-shared.ts` 共享；两侧都用同一份 |
| KaTeX 在子页是否也加载了样式 | 实现第一步核实 `InterestsCategoryPage.astro` 是否走 `ContentLayout`；若否，在 `interests.css` 单独引入 KaTeX 样式 |
| 图片路径写错只在线上暴露 | E2E 断言 `naturalWidth > 0`，本地即可抓到 |
