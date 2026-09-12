# 富内容渲染测试文档（图片 / 代码 / 公式）

## 1. 文档状态

- 类型：测试文档（`docs/testing-strategies/`），属
  [`2026-09-03-testing-strategy.md`](2026-09-03-testing-strategy.md) 之下针对单一主题的细化指导。
- 状态：**草案，待用户批准**。与三份设计文档同步生效，实现授权后才进入执行。
- 适用的三份设计：
  - [`docs/design/2026-09-10-projects-enhancement3.md`](../design/2026-09-10-projects-enhancement3.md)
  - [`docs/design/2026-09-12-interests-back-rich-text.md`](../design/2026-09-12-interests-back-rich-text.md)
  - [`docs/design/2026-09-12-prose-code-math-styling.md`](../design/2026-09-12-prose-code-math-styling.md)
- 设计期预验证：`tests/artifacts/2026-09-12-rich-content-preview/`（临时产物，已 gitignore），
  结论见本文 §11。

## 2. 为什么要单独一份测试文档

三条理由，每条都来自本仓库的具体情况，不是通用模板：

1. **同一段 Markdown 会在三种互不相干的容器里渲染。** 正文是 72ch（实测 576px）、
   Interests 浮层背面是 68ch 窄栏（实测内容宽 504px）、项目网格卡片里则是完全不含富文本的纯文本。
   同一条语法在不同容器里的失效方式不同：正文里够宽的公式，在窄栏里就会溢出。
   按「容器」而不是按「语法」组织测试，才抓得到这类缺陷。
2. **本站目前没有任何真实代码块与公式。** 构建产物里既查不到 `class="astro-code"`，
   也查不到 `class="katex`（`src/content/` 下零个围栏代码块、零个 `$$`）。
   也就是说本次改动**在本站现有内容上「看不见」**，无法用正式页面验收，必须靠 fixture。
3. **反过来，这一条正好是可用的证据**：正因为正式内容里没有代码块与公式，
   本次改动对线上页面的可见影响**应当为零**。这个「零影响」本身要被断言，而不是被假设。

## 3. 渲染位置清单

容器宽度为本机 1440 视口下的**浏览器实测值**（探针脚本读 `getBoundingClientRect()`，非文档推算）。

| 编号 | 位置 | 容器实测宽 | 由谁渲染 | 测试层级 |
| --- | --- | --- | --- | --- |
| **P1** | 文章正文：Notes / Projects / Tips 内容页（含 `.mdx`，见 `tips/en/fixture-tip.mdx`） | `.prose` 72ch = **576px**（页面另有 `min(100%,760px)` 上限） | `@astrojs/markdown-remark` 主处理器 + Shiki + KaTeX | Level 2 |
| **P2** | 栏目目录页：Projects index 的项目入口网格 | `.content-page--wide` 80% = **1078.3px** | `ProjectCard.astro` + `prose.css` | Level 2 |
| **P3** | Interests 卡片背面浮层（`cards[].body`） | 68ch 窄栏，内容宽 **504px** | `card-body.ts` 独立处理器 → `<template>` → `interests.js` `cloneNode` | Level 2 + Level 3（翻面交互） |
| **P4** | Interests 大图背面（`heroImages[].body`） | 同 P3 | 与 P3 **共用同一渲染函数**，改一处动两处 | Level 2 |
| **P5** | 卡片正面主图（`image` 字段） | 卡片宽度 | `astro:assets`（`image()` helper） | Level 2 |
| **P6** | 项目卡片副标题（`subtitle` / `description`） | 卡片宽度 | `ProjectCard.astro` 纯文本插值 | Level 2（几何），无富文本 |

**P3 与 P4 必须一起测**：两者共用 `renderCardBody()`，只测卡片会漏掉大图背面。
反过来，如果实现时为了「只覆盖卡片」而加分支，那本身就是一处应当被质疑的复杂度。

## 4. 内容类型清单

| 编号 | 类型 | Markdown 写法 | 备注 |
| --- | --- | --- | --- |
| T1 | 行内代码 | `` `code` `` | 现有红棕配色，本次**不改样式** |
| T2 | 围栏代码块 | ` ```js ` | 本次改：**深色块**（亮色主题下也是深色）、去边框、语言标签 |
| T3 | 超长单行代码 | 单行 > 200 字符 | 必须横向滚动，`white-space` 不得为 `pre-wrap` |
| T4 | 行内公式 | `$E = mc^2$` | 随文字流，不滚动 |
| T5 | 独立公式 | `$$ ... $$` | 居中、上下留白 |
| T6 | 超宽独立公式 | 长 `$$ ... $$` | 必须可横向滚动，`overflow-y` 为 `hidden` |
| T7 | 图片 | `![alt](/path)` 或相对路径 | P1 与 P3 的路径规则**不同**，见 §7 |
| T8 | 基础语法 | `**粗体**`、`[链接](url)`、`- 列表` | 卡片背面新增能力 |
| T9 | 代码块语言标签 | **Astro 自带**：`@astrojs/internal-helpers/dist/shiki.js` 第 111 行无条件写 `dataLanguage` | 不是作者手写的语法，**也不需要自定义 transformer**（设计文档 §4.2 已更正） |
| T10 | 复制按钮 | `ContentLayout.astro` 内联脚本注入 | 本次改可见性**与配色**，不改脚本 |

## 5. 测试矩阵

`—` 表示该位置不承载该类型；`✓` 表示需要断言。单元格内是该位置**最关键的断言**。

| 位置 | T2/T3 代码块 | T1 行内码 | T4/T5 公式 | T6 超宽公式 | T7 图片 | T9/T10 标签与按钮 |
| --- | --- | --- | --- | --- | --- | --- |
| **P1 正文** | ✓ `border-top-width === 0px`；**浅色站内主题下计算背景也必须是深色**（≠ 页面底色、亮度低于 `--surface`），且与 `pre.style.backgroundColor`（内联仍是 `#fff`）**不相等** | ✓ 颜色未被本次改动影响 | ✓ 行内 `.katex` 存在；独立 `.katex-display` 存在 | ✓ `scrollWidth > clientWidth` 且 `overflowX === 'auto'`、`overflowY === 'hidden'` | ✓ `naturalWidth > 0` | ✓ `data-language` 存在且 `::before` 的 `content` 等于语言名；**`::before` 颜色与块底色的对比度 ≥ 4.5:1**；按钮 `opacity` `0 → 1` 且其前景/背景对比度 ≥ 4.5:1 |
| **P2 项目网格** | — | ✓ 仅确认未被牵连 | — | — | — | — |
| **P3 卡片背面** | — 不做美化，但**必须不破版**（见下） | ✓ 存在 | ✓ `.katex` / `.katex-display` 存在 | ✓ 同上，且容器是 504px 窄栏 | ✓ `naturalWidth > 0` | — |
| **P4 大图背面** | 同 P3 | 同 P3 | 同 P3 | 同 P3 | 同 P3 | — |
| **P5 卡片正面图** | — | — | — | — | ✓ 仍加载成功（回归） | — |
| **P6 副标题** | — | — | — | — | — | ✓ **反向断言**：副标题内不得出现 `<strong>` / `<img>` / `.katex` |

**P3 的「不破版」怎么断**：背面若出现围栏代码块，不要求美化，但要求
「`.interests-overlay__back-scroll` 的 `scrollWidth <= clientWidth`，或其在需要时确实可横向滚动」，
即**不得把浮层撑宽或造成双向滚动**。

**P6 的反向断言为什么必需**：副标题走的是纯文本插值（设计文档 §6 明确「不给副标题加富文本能力」）。
只断言「副标题文字可见」无法区分它到底渲染成了纯文本还是 HTML，必须断言**不存在富文本节点**。

## 6. 断言方法细则

本节是本文档的核心。前四条是**本项目已经付过学费的教训**，后两条是本次预览阶段实测到的陷阱。

### 6.1 几何断言不可替代

只断言「元素可见 / 文本非空」抓不到视觉缺陷。已发生的两次实例：

- Interests 三期：文本非空断言全绿，但避让边写反导致文本被后一张卡裁掉——
  只有 `textRect.right <= nextRect.left` 这类**几何断言**才抓得到。
- Projects enhancement3：只断言「副标题可见」抓不到网格列数没变——
  必须读 `getComputedStyle(grid).gridTemplateColumns` 并数轨道条数。

因此本主题的所有尺寸类结论**一律测量，不推断**。

### 6.2 颜色断言必须比对 token，不能硬编码

从 `src/styles/tokens.css` 读值时，测试里也不要写死 `#f3f3f2`，
而要断言「计算结果 === `getComputedStyle(document.documentElement).getPropertyValue('--surface')` 转换后的值」。

但**深色代码块的底色不来自站点 token**（来自 Shiki 主题 `dark-plus` 的 `#1e1e1e`），
所以这条对代码块的写法要改成：断言计算背景**既不等于** `--bg`、**也不等于** `--surface`，
且其 WCAG 相对亮度低于 `--surface` 的亮度。硬编码 `#1e1e1e` 会掩盖「主题名被改错」这类缺陷。

### 6.2b 计算值 ≠ 内联值（本次修订新增，★ 极易误判）

Shiki 把浅色主题的颜色写成 `<pre>` 上的**内联** `style="background-color:#fff"`。
样式表里的 `!important` 规则**能压过内联声明**，所以：

| 读法 | 浅色主题、代码块已改深色时的值 | 能说明什么 |
| --- | --- | --- |
| `pre.style.backgroundColor` | `rgb(255,255,255)`（仍是内联的浅色） | **完全不能**说明改没改；照它断言会误判「没生效」 |
| `getComputedStyle(pre).backgroundColor` | `rgb(30,30,30)`（`!important` 覆盖后的值） | 这才是真实呈现的颜色 |

因此：**颜色一律读 `getComputedStyle`，永远不要读 `el.style.*` 下结论。** 两者不相等不是 bug，是预期。

### 6.2c 对比度断言（本次修订新增）

「元素存在」不代表「元素看得见」。深色代码块上最容易失效的是两个按浅色底配色的元素：
语言标签（`pre::before`）与复制按钮。必须断言：

```
对比度(getComputedStyle(pre, '::before').color, getComputedStyle(pre).backgroundColor) >= 4.5
```

依据：本轮实测在未改配色的情况下，语言标签对比度仅 **1.16:1**（视觉上等于消失），
改后为 **16.67:1**。对比度计算用 WCAG 相对亮度公式，可写在 `page.evaluate` 内的小工具函数里
（`page.evaluate` 只序列化函数本身，外部常量带不进去，必须就地定义）。

### 6.3 溢出断言必须是三元组

只断 `overflow-x: auto` 是无效的：没有溢出时它同样是 `auto`。
必须同时断言 **`scrollWidth > clientWidth`（确实溢出了）** 与 **`overflowX` / `overflowY` 的值**。
T3 与 T6 都适用。

### 6.4 图片必须断言 `naturalWidth > 0`

断言 `<img>` 存在只能证明标签渲染出来了；**路径写错时标签照样存在**。
`naturalWidth > 0` 才证明图片真的加载成功。这一条对 P3 尤其关键，
因为卡片背面走的是站点绝对路径（§7），路径错误只在运行时暴露。

### 6.5 可见性断言必须等过渡结束（本次预览实测到的坑）

复制按钮带 `transition: opacity .15s`。预览脚本在 `hover()` 之后**立刻**读
`getComputedStyle(...).opacity`，拿到的是 `0.113035` —— 过渡才跑了 11%。
若断言写成 `opacity === '1'`，会得到一个**假失败**，然后很可能被误判成「CSS 没生效」。

正确做法：hover 后 `waitForFunction(() => opacity === '1')`，或等待时长大于过渡时长。

### 6.6 深浅双主题必须分别 hover 对应的元素（本次预览实测到的坑）

预览脚本第一版只 hover 了**浅色面板**里的 `<pre>`，却去读**深色面板**按钮的 `opacity`，
结果恒为 `0`。这个数字看起来像「深色主题下按钮不可见」这个真实缺陷，
实际上只是**测错了元素**。修正为按面板分别 hover 后，两面都得到 `0 → 1`。

这两条合起来说明一个更一般的原则：**样式的观测脚本本身也会给出错误结论，观测结果与实现同样需要被交叉检查。**

### 6.7 判断截图颜色必须采样像素（本次修订实测到的坑）

本轮测试中，我据一张缩略截图判定「深色站内主题下代码块仍是浅色，站内既有规则没生效」，
并准备按此改代码。用 `sharp` 读该 PNG 的像素后立刻证伪：

| 截图 | 采样像素 | 结论 |
| --- | --- | --- |
| `02b-code-current-light.png` | `rgb(255,255,255)` | 浅色主题下确实是白底（改前行为，正确） |
| `02b-code-current-dark.png` | **`rgb(36,41,46)`** | 深色主题下**早已是** `#24292e`，既有规则一直生效 |
| `02b-code-darkplus-light.png` | `rgb(30,30,30)` | 改后 |
| `02b-code-darkplus-dark.png` | `rgb(30,30,30)` | **与浅色主题像素完全一致** → 证明确实「两套主题外观一致」 |

**结论：不要用肉眼（尤其是缩放后的截图）判断颜色。** 判定路径只有两条——
读 `getComputedStyle`，或对 PNG 采样像素。本项目的截图归档脚本应当顺带输出采样值，
让「颜色是否生效」这件事有可复核的数字。

## 7. Fixture 设计

fixture 构建由 `scripts/playwright-site.mjs` 驱动：设 `TEST_CONTENT_FIXTURES=1`，
Astro 以 `tests/fixtures/content/` 作为内容源，产物与缓存写入系统临时目录，
随后由 `scripts/run-playwright.mjs --project=chromium` 起静态服务。

### 7.1 新增内容 fixture

| 文件 | 用途 |
| --- | --- |
| `tests/fixtures/content/notes/zh/rich-content.md`（+ `en/`） | 承载 T1–T7 全部类型：两道围栏代码块（含一道超长单行）、行内码、行内公式、独立公式、超宽公式、图片、列表 |
| `tests/fixtures/content/projects/zh/rich-content.md`（+ `en/`） | 同上（P1 的另一种内容页形态，验证 Projects 页不是特例） |
| `tests/fixtures/content/interests/{zh,en}/<类别>/_index.md` | 在 `cards[]` 里新增一张带富文本 `body` 的卡（T4/T5/T6/T8），并新增一条带富文本的 `heroImages[]`（覆盖 P4） |

**改动既有 fixture 时的纪律**：现有 E2E 断言依赖 fixture 的条目数量与文案
（如首页文案、目录页条目数）。新增条目后**必须重跑全量**，
不得因为「只是加了一条 fixture」就跳过回归。

### 7.2 图片路径：一条新发现的约束

`astro.config.mjs` **没有覆盖 `publicDir`**，fixture 构建与生产构建共用仓库根的 `public/`。
因此：

- ❌ **不要把测试图片放进 `public/media/interests/`** —— 它会被复制进 `dist/`，
  测试素材污染正式站点。这正好是卡片背面设计文档 §3.4 选定的图片目录，
  所以这条约束必须显式记下来。
- ✅ **P1（正文）的 fixture 图片**：放在 fixture md 文件**旁边**，用相对路径引用
  （`![](./rich-content-image.png)`），由 Vite 处理，不进 `public/`。
- ✅ **P3（卡片背面）的 fixture 图片**：`body` 是 frontmatter 字符串，只能写站点绝对路径，
  所以**复用生产环境已有的资源**（`public/social/default.png` → `/social/default.png`）。
  这样既能验证「站点绝对路径能正确加载」，又不新增任何进入生产产物的文件。
- 备选方案：在 fixture 模式下把 `publicDir` 指向 `tests/fixtures/public`。
  这会改动 `astro.config.mjs` 的构建配置，属更大范围的改动，
  仅在确需独立 fixture 图片时采用，并单独说明理由。

### 7.3 需要新增的测试文件

| 文件 | 覆盖 |
| --- | --- |
| `tests/unit/card-body.test.ts` | 卡片背面编译结果与原始 HTML 剥离（卡片背面设计文档 §6.1 的七条） |
| `tests/e2e/prose-styling.spec.ts` | P1 的 T2/T3/T6/T9/T10（浅色 + 深色） |
| `tests/e2e/interests.spec.ts`（补充） | P3 / P4 的 T4–T8 与回退路径 |
| `tests/e2e/projects.spec.ts`（补充） | P2 的网格几何、P6 的副标题与反向断言 |

## 8. 视觉证据规范

按 `2026-09-03-testing-strategy.md` §5：临时产物进 `tests/artifacts/YYYY-MM-DD-topic/`，
用户验收后**只**把代表性截图移入 `docs/documents/assets/YYYY-MM-DD-topic/`。

本主题要求的最小证据集：

1. **P1 代码块特写**：浅色 + 深色各一张，且**必须包含 hover 状态**（复制按钮可见），
   否则无法证明 §4.1–§4.3 的视觉决策落地；
   另需一张**能同时看到语言标签与复制按钮**的特写，用于核对配色（§6.2c）；
2. **P1 公式特写**：含一条超宽公式，且能看出它被裁切（可横向滚动）；
3. **P3 卡片背面**：窄栏内的图片 + 公式，浅色 + 深色各一张；
4. **P2 项目网格**：1440 与 1680 两档，另加 1024 一档——
   1024 会由 3 列变 2 列，是设计文档 §4.1 显式声明的**需用户知情的副作用**，必须截图确认；
5. **P6 副标题截断**：至少一张能看出 2 行截断的卡片。

**每张颜色相关的截图都要附采样值**（见 §6.7）。只给图不给值，等于把判断权交给肉眼。

截图必须由**真实浏览器渲染**产生，且尺寸档位写进文件名或归档说明，
不得使用预览稿（§11 那个模拟页）冒充实现截图。

## 9. 明确不做与已知盲区

### 9.1 本次不做

- **不做自动视觉回归**（`tests/snapshots/` 无基线）。建立基线需要新机制与授权，
  超出本次范围；截图仍以人工审阅为准。
- **不测代码块标题栏、行号、行高亮、折叠、公式编号** —— 均为设计明确的非目标。
- **不往正式内容里塞示例文章**。示例只进 fixture（设计文档 §7 非目标）。

### 9.2 已知盲区（须在交付报告里如实列出）

| 盲区 | 影响 |
| --- | --- |
| 本机只装了 Chromium | WebKit / Firefox 的渲染**零证据**，尤其 Safari 的 `-webkit-line-clamp` 与字体度量差异 |
| 无触屏设备验证 | 复制按钮默认 `opacity: 0` 依赖 hover；触屏下 `:hover` 是否被浏览器模拟、按钮是否可达，**未验证**。设计文档 §9 已列为风险 |
| fixture 页 ≠ 正式页 | 正式内容无代码块与公式，因此本次改动的线上可见影响应为零；但「零影响」只能在构建产物的字符串层面与首页/栏目页截图上证明，不能证明线下未知内容 |
| 窄屏代码块观感 | 横向滚动在窄屏（390px）下的实际手感未在真机确认 |

## 10. 交付测试报告的要求

按 `2026-09-03-testing-strategy.md` §7 的六项之外，本主题追加两条：

1. **必须给出「正式页面影响为零」的证据**：生产构建后检索 `dist/**/*.html`，
   确认正式页面中代码块与公式的数量与改动前一致（当前为 0），
   并给出首页 / 栏目页与改动前的对比截图或几何数值。
2. **必须区分「实现截图」与「设计期预览稿」**：报告里引用预览稿时必须标注其为模拟，
   不得让读者误以为功能已实现。

## 11. 设计期预验证结果（2026-09-12，已完成，含两轮）

在实现授权之前，用一次性脚本
`tests/artifacts/2026-09-12-rich-content-preview/build-preview.mjs`
把三份设计描述的效果在 Chromium 1440 视口下预渲染。它从 `src/styles/tokens.css` 解析真实 token、
用仓库内 **KaTeX** 真实渲染公式、用仓库内 **Shiki** 真实渲染代码块（并复刻 Astro 对 class /
`data-language` / 内联样式的后处理），再由浏览器实测后把数字回填进页面。
**这不是实现验收**，作用是三条：

### 11.1 量化了预期（可作为验收基线）

| 项 | 实测值 | 与设计文档是否一致 |
| --- | --- | --- |
| P2 改前网格（1440） | 4 列 × 257.6 × 171.7px | ✅ 与设计文档 §3 实测值**完全一致** |
| P2 改后网格（1440） | 3 列 × 348.8 × 232.5px | ✅ 与设计文档 §4.1 预测值**完全一致** |
| 卡片底部信息条 | 87.3px，占卡片高 37.5% | ≈ 设计文档 §4.4 的「约 85px / 36%」 |
| 封面比例 `5 / 4`（已选定） | 卡片 348.8 × 279、可见封面 191.7–210.7px | ✅ 与设计文档 §4.5 一致（+32.0%） |
| 代码块边框 | `border-top-width: 0px` | ✅ 去边框生效 |
| 代码块底色（推荐方案，浅色主题） | 计算值 `rgb(30,30,30)`，内联仍为 `rgb(255,255,255)` | ✅ `!important` 压过内联，见 §11.2 |
| 代码块底色（深色主题） | `rgb(30,30,30)`（与浅色主题**像素级相同**） | ✅ 两套站内主题外观一致 |
| 注释色对比度（三方案） | `github-dark` 3.05:1 / `dark-plus` **5.0:1** / `one-dark-pro` 3.73:1 | ✅ 支撑选定 `dark-plus`，见设计文档 §4.6 |
| 语言标签对比度 | 沿用 `var(--muted)` 时 **1.16:1**；改后 **16.67:1** | ✅ 量化了 §4.7 那个易漏点 |
| 复制按钮 | 静止 `opacity: 0` → hover `1`（浅、深两次独立验证） | ✅ |
| 长行代码（正文 72ch = 576px） | `scrollWidth 1114 > clientWidth 576`，`overflow-x: auto` | ✅ 不折行 |
| 超宽公式（正文 576px） | `616 > 576`，`overflow-x: auto`、`overflow-y: hidden` | ✅ |
| 超宽公式（窄栏 504px） | `616 > 504`，同上 | ✅ 窄栏保护生效 |
| 卡片背面图片 | `naturalWidth = 267` | ✅ 真加载 |
| 公式渲染 | 行内 5 个、独立 6 个 | ✅ KaTeX 真实输出 |

### 11.2 验证了一条关键的 CSS 覆盖

预览页给 `<pre class="astro-code">` 加了 Shiki 会写入的**内联** `background-color: #fff`，
结果 `getComputedStyle(pre).backgroundColor` 是 `rgb(30,30,30)`——证明
`!important` 的样式表规则**确实能压过内联样式**，深色块方案在 CSS 层面成立。
这条如果不预验证，很可能在实现后才发现要去调优先级。
同时也确立了 §6.2b 那条判据：**两个值不相等是预期，读 `el.style.*` 会得出错误结论。**

### 11.3 暴露了观测陷阱（已写入 §6.5 / §6.6 / §6.7）

脚本前后修正了四处错误，每一处都会产出「看起来很像真缺陷」的假数据：

| 错误 | 现象 | 已固化为 |
| --- | --- | --- |
| hover 后未等过渡结束就读 `opacity` | 读到 `0.113`，像「CSS 没生效」 | §6.5 |
| hover 了浅色面板却读深色面板的按钮 | 恒为 `0`，像「深色主题下按钮不可见」 | §6.6 |
| 预览画布多加了 32px 内边距 | 卡片量到 249.1 而非 257.6，**测量容器本身没对齐，数字系统性偏小** | §11.3 |
| 长行演示放在全宽容器里 | `scrollWidth === clientWidth`，折行与不折行读数相同，**等于没测** | 设计文档 §4.5 |
| 注释色探针抓到外层 `<span class="line">` | 量到的是 `<pre>` 的继承色而非注释色 | §6.2c |
| 据缩略截图判断颜色 | 误判「深色主题下仍是浅色」，取像素后证伪（`rgb(36,41,46)`） | §6.7 |

**结论：治理观测方法的成本，远低于被观测数据误导的成本。**

证据：`tests/artifacts/2026-09-12-rich-content-preview/`
（`preview.html` + `measurement.json` + 逐方案 / 逐比例截图；`run.log` 与 `probe-*.mjs` 为过程文件）。
