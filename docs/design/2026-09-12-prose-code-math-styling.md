# 正文代码与公式的展示样式 + 内容维护文档整理 设计

## 文档状态

- 类型：设计文档（派生自用户于 2026-09-12 提出的第三项需求）
- 日期 / 主题：2026-09-12 / prose-code-math-styling
- 状态：**草案，待用户批准**。批准前不进入实现。
- 修订：**2026-09-12 二稿**。用户追加「亮色主题下也要 VS Code 式深色代码块」，
  据此重写 §4.1，并因源码核对推翻了原 §4.2（`data-language` 无需自定义 transformer），
  新增 §4.6（主题选型依据）与 §4.7（语言标签 / 复制按钮的连带改动）。见 §3.3 核对清单。
- 关联文档：`docs/documents/content-authoring.md` §10 §11（将被本次整理取代相应段落）、
  `docs/documents/visual-and-interaction-system.md`（排版与交互现状）。
- 测试文档：`docs/testing-strategies/2026-09-12-rich-content-rendering.md`（位置 × 内容类型测试矩阵）。

## 1. 需求与澄清结论

需求两句话：

1. 整理「各栏目怎么增加 / 删除文章」以及「文章里怎么引入图片、代码、公式」的方法；
2. 公式和代码的展示方式希望更好看，参考现成做法。

| 决策点 | 结论（2026-09-12 与用户确认） |
| --- | --- |
| 参考对象 | 用户指定参考 Lil'Log（`lilianweng.github.io`）的代码与公式呈现 |
| 技术栈 | **保留 KaTeX + Shiki**，只借鉴视觉手法，零新增依赖 |
| 代码块视觉 | **2026-09-12 修订**：改用**深色块**（亮色主题下也用 VS Code 式黑底彩色代码），去掉边框。原「浅色主题下用 `--surface` 浅灰底」作废 |
| 深色档主题 | **`dark-plus`**（VS Code 原版 Dark+）。依据是注释色对比度 5.0:1 达标，见 §4.6 |
| 长行 | **横向滚动，不折行**（不采用 Lil'Log 的 `text-wrap: wrap`） |
| 文档产物 | 重写并补齐 `docs/documents/content-authoring.md`，不新开并行文档 |

## 2. 参考对象的调研结论（2026-09-12 实测）

抓取 `lilianweng.github.io` 的文章 HTML 与样式表后确认：

| 维度 | Lil'Log 实际做法 |
| --- | --- |
| 主题 | Hugo + PaperMod |
| 公式 | **MathJax 3**，CDN 加载 `tex-mml-chtml.js`，**浏览器端渲染** |
| 代码 | **highlight.js**（`assets/js/highlight.min.*.js`），运行时高亮 |
| 代码块外观 | 整块深色底（`--hljs-bg`）+ 圆角，浅灰字 `#d5d5d6`，`padding: 10px`，**无边框** |
| 复制按钮 | `.copy-code` 默认 `display: none`，`div.highlight:hover .copy-code, pre:hover .copy-code` 才 `display: block` |
| 长行 | `text-wrap: wrap` + `word-break: break-all`，**自动折行** |
| 行内代码 | 仅一层浅底色，**无边框** |
| 行号 | 需显式开启 `.highlighttable`（`td:first-child { width: 40px }`） |

**结论：它这两项技术选择相对于本项目都是降级，不采纳。**

- MathJax 是浏览器端渲染：首屏公式会闪一下（FOUC），且要额外加载 JS 运行时。
  本项目已是**构建期 KaTeX**，输出静态 HTML + CSS，无 JS、无闪烁、体积更小。
- highlight.js 是运行时高亮且单主题；本项目用 **Shiki**，构建期完成，且
  `astro.config.mjs` 第 46 行配置了 `{ light: 'github-light', dark: 'github-dark' }`
  双主题，与站点明暗切换联动。换成 highlight.js 会丢掉这个联动。

**但它的三处视觉处理值得借鉴**，构成本次设计的主体：用**色块**而不是边框建立代码块边界、
复制按钮 hover 才出现、以及「代码块整体是一块独立的深色区域」的观感。
（Lil'Log 的代码块本来就是深色块，这一点在 2026-09-12 用户追加「亮色主题下也要深色块」后
与本项目完全一致；差别仍在技术栈：它靠 highlight.js 运行时上色，本项目靠 Shiki 构建期上色。）

## 3. 现状与一个关键发现

### 3.1 现状样式（`src/styles/prose.css`）

| 行 | 规则 | 问题 |
| --- | --- | --- |
| 46 | `.prose pre { position: relative; overflow-x: auto; border: 1px solid var(--divider); border-radius: .45rem; padding: 1rem; }` | 浅色主题下 Shiki 的 `github-light` 背景是 `#fff`，与 `--bg` 完全同色，代码块只剩一条边框，视觉偏平 |
| 47 | `[data-theme='dark'] .astro-code, ... span { color/bg 用 --shiki-dark-* }` | 深色主题改的是 Shiki 自带背景，未与站点 token 统一 |
| 48 | `.code-copy { position: absolute; top: .45rem; right: .45rem; ... }` | **常驻显示**，一直遮挡代码右上角 |
| 49 | `.prose :not(pre) > code { font-family: var(--mono); color: #a23625; font-size: .9em }` | 红棕行内码，深色下换 `#ee9182`；无底色 |
| 56 | `.prose .katex-display { overflow-x: auto; overflow-y: hidden; padding: .5rem 0 }` | 溢出保护已有，但滚动条是系统默认粗样式 |

### 3.2 关键发现：当前没有任何真实内容能验证这套样式

对构建产物做了定量核查：

- `src/content/` 下**零个**围栏代码块（无 ``` ）、**零个** `$$` 公式、**零个** callout；
- `dist/**/*.html` 中**不存在** `class="astro-code"`，即没有任何一个渲染出来的代码块；
- `dist/**/*.html` 中**不存在** `class="katex`，即没有任何一个渲染出来的公式；
- 唯一命中 `<code>` 的是 `projects/large-platform/index.html`，属行内代码。

**设计含义：本次样式改动在本站当前内容上「看不见」，无法用现有页面验收。**
因此验证策略必须以 **fixture 页面**为主，并把截图作为主要证据（§6）。

这同时印证了此前的项目盘点结论：站点目前是「框架完整、内容是空的」，
真正卡住观感的是内容缺口，而不是样式能力。

### 3.3 已核对的事实（2026-09-12 二次核对，覆盖草案中的推测）

草案里若干结论是**从间接证据推断**的，本轮直接读了 Astro 与 Shiki 的源码/真实输出复核：

| 事项 | 核对方式 | 结论 |
| --- | --- | --- |
| Shiki 输出的 `<pre>` 类名 | 调真实 `shiki.codeToHtml` | `class="shiki shiki-themes github-light github-dark"`，Astro 把其中所有 `shiki` 替换成 `astro-code`，故实际为 `astro-code astro-code-themes …`。**`.astro-code` 选择器有效** |
| 深色变量名 | 同上 | `--shiki-dark` / `--shiki-dark-bg`，写在 `<pre>` 的**内联** `style` 上 |
| 浅色颜色是否内联 | 同上 | 是。默认 `defaultColor` 为 `light`，浅色写成内联 `color` / `background-color`，深色只进变量 |
| `data-language` | 读 `@astrojs/internal-helpers@0.11.0/dist/shiki.js` 第 111 行 | **Astro 无条件写入**。草案「需要自己加 transformer」的说法错误，见 §4.2 |
| `wrap: false` 的副作用 | 同文件第 112–113 行 | Astro 会在 `<pre>` 内联样式末尾追加 `overflow-x: auto;`，即长行横向滚动本就是内联强制的 |
| `.astro-code` 内联样式能否被 CSS 覆盖 | 浏览器实测 | 能——`!important` 的样式表规则可压过内联声明。预览页已验证 |

> 这三条「读源码得到的确定事实」替换掉草案里三处推测，是本次修订幅度最大的部分。

## 4. 设计决策

### 4.1 代码块：改用深色块，去掉边框

**2026-09-12 用户追加**：亮色主题下也想要 VS Code 那种「黑色背景 + 彩色代码」。
原方案（浅色主题下用 `--surface` 浅灰底）作废。

#### 4.1.1 机制：一条 CSS 就能做到，不需要动渲染管线

Shiki 在构建期把**浅色主题**的颜色写成 `<pre>` 上的**内联** `style`，
同时把**深色主题**的颜色放进 `--shiki-dark` / `--shiki-dark-bg` 两个 CSS 自定义属性。
实测输出（真实 Shiki 4.4.3，配置为 `themes: { light: 'github-light', dark: 'dark-plus' }`）：

```html
<pre data-language="javascript"
     class="astro-code astro-code-themes github-light dark-plus"
     style="background-color:#fff;--shiki-dark-bg:#1E1E1E;color:#24292e;--shiki-dark:#D4D4D4; overflow-x: auto;">
  <code><span class="line"><span style="color:#D73A49;--shiki-dark:#569CD6">function</span>…
```

因此「让亮色主题也用深色代码块」= 把现有第 47 行的 `[data-theme='dark']` 前缀去掉，
让两套站内主题都去读深色变量。**CSS 侧只改一个选择器前缀。**

```css
/* src/styles/prose.css 第 47 行改写：去掉主题作用域 */
.astro-code,
.astro-code span { color: var(--shiki-dark) !important; }
.astro-code { background-color: var(--shiki-dark-bg) !important; }
```

- `background-color` 只作用在 `<pre>` 上（不逐 span 重复写）。两个变量在 `<pre>` 上就地定义，
  所以同元素内即可解析，不需要往上提。
- `!important` **必须保留**：它要压过 Shiki 写在 `<pre>` 上的内联 `background-color`。
  这一点已由预期效果预览实证（内联为 `#fff`、计算值为深色）。

```css
/* src/styles/prose.css 第 46 行改写 */
.prose pre {
  position: relative;
  overflow-x: auto;              /* 保留：长行横向滚动 */
  padding: 2.35rem 1rem 1rem;    /* 顶部留出语言标签与复制按钮的位置 */
  border: 0;                     /* 去边框：边界由色块建立，不再靠一条线 */
  border-radius: .55rem;
  /* 刻意不写 background —— 底色由 Shiki 的深色主题决定 */
}
```

#### 4.1.2 与之配套的配置改动（只有一个词）

```diff
  shikiConfig: {
-   themes: { light: 'github-light', dark: 'github-dark' },
+   themes: { light: 'github-light', dark: 'dark-plus' },
    wrap: false,
  },
```

为什么保留双主题结构、而不是直接写 `theme: 'dark-plus'`：双主题让 `--shiki-dark` 变量继续存在，
**将来若想把亮色主题改回浅色代码块，只需把 CSS 里的 `[data-theme='dark']` 加回去，不必改配置**。
反之若写成单主题，配置与 CSS 得同时回退。深色档主题的选型依据见 §4.6。

### 4.2 语言标签：`data-language` **已经存在**，原方案作废

> ⚠️ **本节是对草案的错误更正。** 草案原文称「Shiki 不保证输出语言属性，
> `data-language` 在 `@astrojs/markdown-remark` 里只由 Prism 分支产生」——**这是错的**。

核对 `@astrojs/internal-helpers@0.11.0/dist/shiki.js` 第 98–116 行的 `pre` transformer：

```js
node.properties.class = classValue.replace(/shiki/g, "astro-code");
node.properties.dataLanguage = lang;          // ← 无条件写入，与 Prism 无关
```

也就是说 **Astro 给每个 Shiki 代码块都写了 `data-language`**，
由 `codeToHast` → hast 序列化成 `data-language="<lang>"`。

**结论：草案 §4.2 里那个 `language-label` transformer 不需要了**，
`astro.config.mjs` 除了 §4.1.2 的主题名之外不做任何改动。
语言标签仍用纯 CSS 伪元素实现：

```css
.prose pre[data-language]::before {
  content: attr(data-language);
  position: absolute; top: .55rem; left: .85rem;
  color: rgba(255, 255, 255, .62);   /* 必须改：见 §4.7 */
  font: .72rem/1 var(--mono);
  letter-spacing: .06em; text-transform: uppercase;
}
```

标签放**左上角**、复制按钮在右上角，两者不重叠。用伪元素而非新增 DOM 节点，
避免破坏现有 `pre > code` 结构与复制脚本的选择器。

（Prism 分支 `dist/rehype-prism.js` 第 9 行确实也写 `data-language`，但那是 `syntaxHighlight: 'prism'`
时的另一条路径，本项目 `syntaxHighlight: 'shiki'`，走不到它。草案据此推断「Shiki 分支没有」，
属于**从一个正确的事实推出了错误的结论**。）

### 4.3 复制按钮：hover / 键盘聚焦才出现

```css
.code-copy { opacity: 0; transition: opacity .15s ease; }
.prose pre:hover .code-copy,
.prose pre:focus-within .code-copy { opacity: 1; }
```

- `:focus-within` 是必需的：纯 `:hover` 会让键盘用户永远看不到按钮。
- 按钮仍由 `ContentLayout.astro` 第 11 行的内联脚本注入，**脚本不改**，
  只改用 CSS 控制可见性。
- **配色必须同时改**：原样式是 `color: var(--muted); background: var(--bg)`，
  在深色块上会变成一块白斑。改后的值见 §4.7。

### 4.4 公式：溢出横向滚动 + 细滚动条

```css
.prose .katex-display { overflow-x: auto; overflow-y: hidden; padding: .5rem 0; scrollbar-width: thin; }
.prose .katex-display::-webkit-scrollbar { height: 6px; }
.prose .katex-display::-webkit-scrollbar-thumb { background: var(--divider); border-radius: 3px; }
```

依据 KaTeX 官方文档给出的标准做法（`.katex-display { overflow: auto hidden }`）。
`overflow-y: hidden` 必须写，否则某些字体度量下会出现多余的纵向滚动条。
**不引入公式编号**——需求没提，且编号会要求在 Markdown 里维护计数器。

### 4.5 明确不做的两件事

1. **不折行**。Lil'Log 用 `text-wrap: wrap` + `word-break: break-all`，
   会把代码缩进层级打断；VitePress / GitHub 均采用横向滚动。取后者。
   实测证据：正文宽度（72ch = 576px）下超长单行 `scrollWidth=1114 / clientWidth=576`，
   `overflow-x: auto` 生效。
2. **不换行内代码样式**。现有红棕行内码（`#a23625` / 深色 `#ee9182`）已有明确的双主题适配，
   改为「浅底色无边框」会削弱它在长段落中的可辨识度。
   注意：行内码在**浅色正文里**仍保持红棕，与代码块变深互不影响——两者不在同一层。

### 4.6 深色档主题的选型（2026-09-12 追加决策）

三个候选全部用真实 Shiki 渲染、由浏览器实测计算值（对比度为 WCAG 相对亮度比，采样点为该 token 的实际颜色）：

| 方案 | 主题 | 块底色 | 正文对比度 | **注释对比度** | 关键字对比度 | 块底色 vs 页面底色 |
| --- | --- | --- | --- | --- | --- | --- |
| 改前 | `github-light` | `#ffffff` | 14.67:1 | 4.82:1 | 4.57:1 | **1:1**（与页面完全同色） |
| A | `github-dark` | `#24292e` | 11.5:1 | **3.05:1** ⚠️ | 5.52:1 | 14.67:1 |
| **B（已选定）** | **`dark-plus`** | **`#1e1e1e`** | **11.25:1** | **5.0:1** ✅ | 5.65:1 | 16.67:1 |
| C | `one-dark-pro` | `#282c34` | 6.57:1 | **3.73:1** ⚠️ | 4.75:1 | 14:1 |

**决策依据不是「哪个更像 VS Code」，而是注释可读性。** 注释是代码里彩度最低、最容易被压暗的
一类 token：方案 A 与 C 的注释对比度只有 3.05:1 / 3.73:1，**低于 WCAG AA 小字标准 4.5:1**，
在深色块上会「看得见但不舒服」；只有方案 B（VS Code 原版 Dark+）达到 5.0:1。
辅以用户的原话「VS Code 那种」，选 **`dark-plus`**。

选它同时成立的两条：

- 它就是 VS Code 默认深色配色（`#1e1e1e` + 关键字 `#569CD6` / 字符串 `#CE9178` / 函数 `#DCDCAA`），
  与需求描述一致；
- 底色 `#1e1e1e` 是**完全中性**的灰（R=G=B），不会与站点暖白色板冲突。

> **实测陷阱记录**：判断「深色块是否真的生效」不能靠看截图。
> 本轮曾据缩略截图误判「深色主题下代码块仍是浅色」，取像素后证伪
> （`rgb(36,41,46)`，站内既有深色规则一直生效）。结论：**颜色一律取像素或计算值，不靠眼睛。**

### 4.7 连带改动：语言标签与复制按钮必须换成浅色（易漏点）

这是「换深色块」最容易被漏掉的后果。两个元素原本都按浅色底配色，底色一变成近黑就失效：

| 元素 | 原值 | 在深色块上的原对比度 | 改后值 | 改后对比度 |
| --- | --- | --- | --- | --- |
| 语言标签（`pre::before`） | `var(--muted)` → `#2a2a2a` | **1.16:1**（几乎不可见） | `rgba(255, 255, 255, .62)` | **16.67:1** |
| 复制按钮 | `color: var(--muted)` + `background: var(--bg)` | 文字对比度不足，且白底在深色块上形成刺眼白斑 | `color: rgba(255,255,255,.78)` + `background: rgba(255,255,255,.09)` + `border-color: rgba(255,255,255,.22)` | 见 §8.1 断言 |

```css
.prose pre[data-language]::before { color: rgba(255, 255, 255, .62); }
.code-copy {
  border: 1px solid rgba(255, 255, 255, .22);
  color: rgba(255, 255, 255, .78);
  background: rgba(255, 255, 255, .09);
}
```

**这两条必须与 §4.1 一起改，不能分开做**——只改底色会导致语言标签消失、复制按钮变白斑，
而这两处都不会被「代码块变深了没有」这类断言捕获。测试文档
`docs/testing-strategies/2026-09-12-rich-content-rendering.md` 已登记为独立断言项。

## 5. 内容维护文档整理（`docs/documents/content-authoring.md`）

现有文档已有 §3–§9 的逐栏目字段说明与 §10 §11 的 Markdown / 图片写法，
所以本次是**重构 + 补齐**，不是从零写。三处实质补充：

### 5.1 新增「删除与下线内容」一节（当前完全缺失）

这是现有文档最大的空缺——只讲了怎么加，没讲怎么删。内容按栏目给出具体步骤与副作用：

| 栏目 | 删除要点 |
| --- | --- |
| Notes / Tips / Projects / Interests | 成对删除 zh / en 两个文件；`translationKey` 相同的另一语言文件若保留，语言切换按钮会指向 404 |
| Notes / Projects / Interests | 是 `[...slug]` catch-all，删除后路由由 `getStaticPaths` 重新生成，**必须重新构建**才能消失 |
| 每一级目录 | 目录页必须靠 `_index.md`（slug 等于该层路径）才成立；删掉中间层的 `_index.md` 会让该层 URL 404，且面包屑里指向它的链接变成死链 |
| 临时下线而非删除 | 用 `draft: true`（公共 schema 第 16 行，默认就是 `true`），不要靠删文件 |
| Tips | `order` 是**必填整数**，删掉同组某一篇后建议检查相邻项的 order 连续性 |
| Projects | `status`（active / completed / archived）必填；固定入口区 `ProjectEntries.astro` 的链接需同步检查 |
| Interests | `cards` 是 frontmatter 数组、`heroImages` 最多 2 条；删卡不影响路由，删**类别子页**才影响 |
| Bio | 用 `variant`（default / long），不需要 slug 与日期，中英各两篇 |
| 首页数据 | `src/data/recent-focus.json`、`src/data/quotes.json` 是独立 JSON，删条目后要留意 `order` 与 `localDataHref` 的链接有效性 |
| 搜索索引 | Pagefind 索引在 `pnpm run build` 时重建；只删源文件不重建，搜索结果里仍会出现旧页面 URL |

并附一份**增删检查清单**（双语配对、目录页 `_index.md`、slug 与文件夹层级一致、
YAML 引号陷阱、构建后核对 404、构建后抽查搜索）。

### 5.2 重写 §10（Markdown、代码、提示块和数学）

替换为与本次样式一致的说明：**亮色主题下代码块也是深色块**（VS Code Dark+ 配色）、
语言标签、复制按钮的 hover 行为、长行横向滚动不折行、公式的溢出滚动，
并明确「代码块与公式当前在站点上还没有真实用例」。同时说明**行内代码仍是红棕**，
不要与代码块混为一谈。

### 5.3 重写 §11（图片与媒体）

把两条路径的分工写清楚，避免混用：

- **随文章维护、需要 Astro 优化的图**：放内容文件附近或 `src/assets/`，相对路径引用；
- **需要稳定原始 URL 的媒体**：放 `public/`，写站点绝对路径；
- **卡片背面配图**（与 Interests 富文本需求交叉）：走 `public/`，详见
  `docs/design/2026-09-12-interests-back-rich-text.md`。

### 5.4 与另一份设计文档的边界

`docs/design/2026-09-12-interests-back-rich-text.md` 需要往 §8 Interests 补「背面富文本写法」。
该段落在本次重构中一并接入，**内容归那份设计，结构归本次重构**，不重复劳动。

## 6. 涉及文件

| 文件 | 改动 |
| --- | --- |
| `src/styles/prose.css` | 第 46 行改写（去边框、不写 background）；第 47 行去掉 `[data-theme='dark']` 前缀；第 48 行复制按钮配色；新增语言标签、hover 复制、滚动条规则 |
| `astro.config.mjs` | `shikiConfig.themes.dark` 由 `github-dark` 改为 **`dark-plus`**（一个词）。**不需要** `language-label` transformer（见 §4.2 更正） |
| `tests/e2e/`（新增 fixture 页或复用 fixture 内容） | 承载代码块与公式的验证页面 |
| `tests/fixtures/content/**` | 新增一篇含代码块、行内码、行内/独立公式、超宽公式的 fixture 文章 |
| `tests/e2e/prose-styling.spec.ts` | 新增，样式与溢出的端到端断言 |
| `tests/fixtures/**` 的图片约束 | 见 `docs/testing-strategies/2026-09-12-rich-content-rendering.md` §7.2：**E2E 图片不得放 `public/`**，否则会随生产构建进入 `dist/` |
| `docs/documents/content-authoring.md` | 按 §5 重构：新增删除章节，重写 §10 §11 |
| `docs/documents/visual-and-interaction-system.md` | 同步代码块与公式的现状描述 |

## 7. 非目标

- 不新增任何依赖（不引入 Expressive Code、highlight.js、MathJax）。
- 不做代码块标题栏、行号、行高亮、折叠、代码分组标签页。
- 不做公式编号 / 交叉引用。
- 不为了「让样式有东西可看」而往正式内容里塞示例文章——示例只进 fixture。
- **不给亮色主题保留浅色代码块**。本次是「两套站内主题都渲染深色块」，
  不做「亮色主题用浅色块 / 深色主题用深色块」的分叉。
- **不改行内代码配色**（仍是红棕 `#a23625` / `#ee9182`）。

## 8. 验证方式

### 8.1 端到端（`tests/e2e/prose-styling.spec.ts`，新建）

在带 fixture 内容的页面上：

1. **代码块底色在浅色站内主题下也是深色**：读 `getComputedStyle(pre).backgroundColor`，
   断言**不等于**页面底色且亮度低于 `--surface` 的亮度；再断言它等于该深色主题的背景值。
   ⚠️ **必须与「内联样式值」区分**：`pre.style.backgroundColor` 仍是 Shiki 写的 `#fff`，
   `!important` 覆盖的是**计算值**。只断言内联值会误判为「没生效」。
2. 代码块 `borderTopWidth === '0px'`（去边框）——浅色与深色各测一次。
3. 代码块存在 `data-language` 属性，且 `pre::before` 的 `content` 等于该语言名。
4. **语言标签在深色块上可读**：读 `getComputedStyle(pre, '::before').color`，
   与 `pre` 的计算背景色算 WCAG 对比度，断言 **≥ 4.5:1**。
   这是 §4.7 那个易漏点的**唯一**防线——「标签存在」不代表「标签看得见」。
5. **复制按钮配色**：同样断言其前景 / 背景对比度 ≥ 4.5:1，且背景**不是** `--bg` 的浅色。
6. **复制按钮初始不可见、hover 后可见**：断言 `opacity` 由 `0` 变为 `1`；
   键盘聚焦（`focus()` 到 `pre` 内）后同样可见。读值前必须等过渡结束。
7. **长行不折行**：造一个超长单行，断言 `scrollWidth > clientWidth` 且
   `whiteSpace !== 'pre-wrap'`。**容器宽度必须约束到正文真实宽度（72ch）**，
   否则 `scrollWidth === clientWidth`，折行与不折行读数相同，等于没测。
8. 超宽独立公式：`.katex-display` 的 `scrollWidth > clientWidth` 时
   `overflowX === 'auto'`，且 `overflowY === 'hidden'`。
9. axe 无障碍扫描仍通过（新增的伪元素与按钮不得引入对比度问题）。

### 8.2 视觉证据（本次的主要验收形式）

因为现状下站点没有真实代码块与公式，截图是唯一的观感判断依据。
在 fixture 页面上按 1440 视口、浅色 + 深色各出一张「代码块 + 公式」特写，
归档到 `tests/artifacts/2026-09-12-prose-code-math-styling/`；
用户验收后把代表性截图移到 `docs/documents/assets/`。

**实现前的配色决策证据**（已完成，可交互）：
`tests/artifacts/2026-09-12-rich-content-preview/preview.html` 的 S2 区块，
四个候选方案并排、真实 Shiki 渲染、实测对比度回填；
`02d-code-theme-table-{light,dark}.png` 为对比度总表，
`02b-code-*-{light,dark}.png` 为逐方案特写，
`02c-code-labels-{light,dark}.png` 为 §4.7 的「改后 / 反例」对照。

### 8.3 全量回归

Chromium 端到端全量 + `astro check` + 生产构建，并确认
**正式页面**（非 fixture）的视觉与当前一致——因为正式内容里没有代码块与公式，
本次改动对线上页面的可见影响应为零。这一条本身就是「不牵连既有内容」的证据。

## 9. 风险

| 风险 | 处置 |
| --- | --- |
| **注释等低彩度 token 在深色块上对比度不足** | 已在 §4.6 量化三个候选：`github-dark` 3.05:1、`one-dark-pro` 3.73:1 均低于 AA 小字 4.5:1；选定 `dark-plus` 为 5.0:1。测试文档登记为断言项 |
| **语言标签 / 复制按钮沿用 `var(--muted)` / `var(--bg)` 后在深色块上失效** | §4.7 给出改后值与实测对比度（1.16:1 → 16.67:1），并在 §8.1 第 4–5 条设为强制断言。**只改底色不改这两处是最可能的漏改路径** |
| 深色块与站点暖白色板的观感冲突 | 选定底 `#1e1e1e` 为中性灰（R=G=B），不含色调；仍以深浅两套截图人工确认 |
| `pre::before` 与复制按钮定位重叠 | 标签固定左上、按钮固定右上，两处断言各自位置 |
| 语言标签高度与预留的 `padding-top` 不匹配，短代码块显得空 | 实现后按截图微调 `padding-top`，并在文档中记录最终值 |
| 常态化 hover 显示按钮会影响触屏（无 hover） | 触屏下 `:hover` 由浏览器模拟为首次点击；同时保留 `:focus-within`。若触屏实测不可用，改为「默认可见、窄屏常驻」并在文档记录 |
| 判断「深色块是否生效」时被截图误导 | 已实际发生一次（截图看错，取像素后证伪）。**颜色一律读计算值或采样像素**，不靠肉眼；§8.1 第 1 条已把「计算值 ≠ 内联值」写成断言 |
| `dark-plus` 属 Shiki 内置主题，若将来升级 Shiki 被改名 | 主题名在 `astro.config.mjs` 集中一处，且构建期若找不到会直接报错（不会静默降级），风险低 |
