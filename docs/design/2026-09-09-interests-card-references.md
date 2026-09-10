# 2026-09-09 Interests 卡牌视觉：参考源整理与方案收敛

> 文档性质：**设计调研与决策记录**（design-phase research & decision survey）。
> 本文档**不构成实现授权**。它整理了几轮聊天里讨论过的每个参考源的效果、机制与许可边界，
> 并记录当前收敛的视觉方向。落地 `src/` 前仍需用户对最终设计文档的明确批准。

对应需求：[`docs/requirements/2026-09-09-interests-enhancement.md`](../requirements/2026-09-09-interests-enhancement.md)
（该需求文档目前只有整体要求与空的「设计思路」章节，本文档是其设计思路的前置调研与决策沉淀。）

## 0. 背景：为什么做这份整理

用户希望把兴趣页前端做得"有意思一点"，倾向用**卡牌**作为组织方式。讨论过程中用户连续抛出了
多个参考站点/pen，询问能否复现、哪个更适合放照片。本轮把这些参考源逐一实测、归类、标注许可，
并据此收敛出推荐方案，避免后续设计文档凭空起笔。

需求原文（摘自 requirements，逐条保留）：
> 第一层主页 `_index` 是一系列兴趣种类，点入任意一个兴趣后，可展示一系列更具体的分类和对应的卡片，
> 每张卡片正面是照片，点击后先放大，再点击则翻面显示文字，再点击则返回最开始的页面原状。

> ⚠️ 注意：该需求原稿描述的交互是「**点击 → 放大 → 再点击翻面 → 再点击返回**」三段式。
> 下面调研中 Parallax Flipping 提供的「单次点击直接翻面」是更简洁的方向，二者在实现前需让用户定夺（见 §4）。

---

## 1. 参考源总表

| # | 参考源 | 效果类型 | 许可边界 | 结论 |
|---|---|---|---|---|
| R1 | CodePen 编辑器欢迎引导（editor/pen?tour=welcome） | onboarding tour（遮罩+聚焦+步骤卡） | **登录墙 + 专有源码**，复用违反服务条款 | ❌ 不能抄码；交互模式通用可从零重写 |
| R2 | CSS-Tricks 首页（css-tricks.com） | 文章卡片（大卡/网格小卡）信息层级 | **明确允许取用**（css-tricks.com/license） | ✅ 借鉴信息层级与语义化，不搬其主题 CSS |
| R3 | `simeydotme/pokemon-cards-css`（GitHub） | 宝可梦全息卡牌 | **GPL-3.0 + Svelte 组件** | ❌ 强 copyleft，不采用 |
| R3b | `simeydotme/hover-tilt`（同作者） | 倾斜+光斑（Web Component） | **MPL-2.0** | ⚠️ 可用但需新依赖，非首选 |
| R4 | `andymerskin` → Parallax Depth Cards（XNMWvQ） | 照片视差深度 | 未标注许可 | ✅ 机制通用，零依赖重写 |
| R5 | `steveeeie` → CSS Filter Cards（NVWMEM） | 聚焦式滤镜 | 未标注许可 | ✅ 机制通用，零依赖重写 |
| R6 | `nicolaspavlotsky` → Parallax Flipping（wqGgLO） | 3D 翻面 | 未标注许可 | ✅ 机制通用，零依赖重写 |

逐源说明见下。

---

## 2. 逐源整理

### R1 · CodePen 编辑器欢迎引导 —— ❌ 不能抄

- 位置：`https://codepen.io/editor/pen?tour=welcome`。
- 实测：该 URL 直接返回**登录页**（只有 Google/GitHub 登录按钮），引导界面是登录后由客户端按账号
  状态渲染的 SPA，源码只存在于压缩 bundle 里，公开页面拿不到任何引导 HTML。
- 即使登录再从 DevTools 扒 bundle，也是 CodePen 专有代码，复用违反其服务条款。
- 但该交互模式（遮罩 + 聚焦高亮 + 步骤卡 + 进度点 + 上一步/下一步/跳过）是**通用 onboarding tour**，
  与本卡牌需求关联度低，仅作为「交互模式可重写」的例证记下。
- 结论：不引入；若日后要 onboarding，零依赖重写。

### R2 · CSS-Tricks 首页 —— ✅ 合法借鉴信息层级

- 许可：`https://css-tricks.com/license` 原文
  "Go ahead. Take whatever code, design, and demos you find on this site."——取用站内代码/设计/示例均被允许，
  唯一禁止的是整篇扒文章冒充自己写的。
- 首页实测到两种卡片结构：
  - 大卡 `<article class="article-card article-card-large">`：`.article-thumbnail-wrap`（1200×600 图 + 完整
    `srcset`，走 `i0.wp.com` Photon CDN）→ `.card-content` → `.article-publication-meta`。
  - 网格小卡 `<article class="mini-card">`（无缩略图，外层 `.mini-card-grid`）：
    `<time datetime>` 类型+日期 → `h3.mini-card-title > a` → `.tags`（`rel="tag"`）→ `.author-row`（头像+作者名）。
- 值得借鉴的是**信息层级**（类型/日期置顶 → 标题 → 标签 → 作者行压底）与**语义化**
  （`<article>`、`<time datetime>`、`rel="tag"`、作者链接带 `aria-label`、图片 `alt` 写画面内容）。
- 不照搬其 WordPress 主题 CSS（挂着 gravityforms/jetpack 等一堆插件样式）。
- 与本卡牌需求的关系：提供"卡面文字层级 + 语义化"参考，非主要视觉来源。

### R3 · `pokemon-cards-css` —— ❌ GPL-3.0，不采用

- 仓库：`https://github.com/simeydotme/pokemon-cards-css`。
- 许可证：**GPL-3.0**（强 copyleft）。把其 CSS/JS 并入站点 → 整站视为衍生作品，须同样按 GPL-3 开源，
  个人信息站通常不可接受。
- 形态：**Svelte 组件**（`App.svelte` / `Cards.svelte`），不是可复制的纯 CSS 片段；本项目无 Svelte 集成，
  引入还新增依赖，越界。
- 全息纹理还依赖外部 holo 遮罩图（README 致谢一张 deviantart 的 Galaxy Holo 图），那些图也不能直接拿。
- 结论：**不采用**。其全息效果的原理（彩虹层 + 光斑 + 倾斜）已零依赖自研复现，见 §3。
- 备注：同作者的 `hover-tilt` 为 **MPL-2.0**（文件级 copyleft，不传染整站），有 Web Component 与
  Astro 官方示例，作技术备选；但仍属新增 npm 依赖，非首选。

### R4 · Parallax Depth Cards（`andymerskin/XNMWvQ`）—— ✅ 适合照片，采纳其机制

- 效果：**照片视差深度**。鼠标移动时，卡片 3D 倾斜，内部背景照片**反向平移**产生纵深。
- 机制三层：
  1. 背景图容器 `inset` 负值放大（约 124%），`transform: translate3d` 随光标**反向平移**；
  2. 卡片外层 `perspective` + `rotateX/rotateY` 3D 倾斜；
  3. 高光用 `soft-light`/`overlay` **温和混合**，不破坏照片色相。
- 关键认知：它**不做镭射强混合**（不用 `color-dodge`/`screen`），因此照片肤色/高光完整保留，只增对比。
- 许可：未标注（CodePen 默认保留权利），但所用技术（perspective + transform + background parallax）是
  通用前端技术，从零重写、不抄源码；原 pen 用 Vue + unsplash 外链，本项目一个都不用。
- 结论：**本卡牌"图片区效果"的首选机制**——解决"全息 `color-dodge` 搅脏照片"的问题。

### R5 · CSS Filter Cards（`steveeeie/NVWMEM`）—— ✅ 采纳其扫视节奏

- 效果：**聚焦式滤镜**。一排卡里，**未被 hover 的卡**压暗、去饱和；被 hover 那张保持全彩并略微放大。
  类似 Dillion 等相似作品里的经典「灰 → 色」reveal，但作用对象是"整排其余卡"而非单卡。
- 机制：`.card-grid:hover > .card:not(:hover) .card__background { filter: brightness(.5) saturate(0) … }`；
  被 hover 的 `.card:hover .card__background { transform: scale(1.05) }`。
- 作用：提供**导视**——一排卡里"当前焦点是哪张"一目了然，比边框高亮自然，也顺势弱化照片的抢眼度。
- 许可：未标注；`filter: grayscale/brightness/saturate` + `transform` 是纯 CSS 通用技术，零依赖重写。
- 结论：**作为卡片墙的悬停节奏层**（默认灰，hover 全彩）。

### R6 · Parallax Flipping（`nicolaspavlotsky/wqGgLO`）—— ✅ 采纳其翻面，但简化

- 效果：**3D 翻面**。卡片 `.front`（背景照片 + 标题）与 `.back`（文字），hover/触摸切 class，
  `rotateY` 翻转。
- 结构：`.col[ontouchstart] > .container > .front` + `.back`，`backface-visibility: hidden`。
- 与本需求关系：正面照片 → 背面文字。但需求原稿的三段式（放大→翻面→返回）更繁琐；本调研倾向**单次点击
  直接翻面**（R6 模式），是否保留"先放大"由用户定夺（§4）。
- 关键点：**翻面与倾斜可共存不打架**——翻转是点击切换的 180°，倾斜是光标连续小角度，可合并写成
  `rotateX(var(--rx)) rotateY(calc(var(--flip) + var(--ry)))`。
- 许可：未标注；`preserve-3d` + `rotateY` + `backface-visibility` 是通用 3D CSS，零依赖重写。
- 结论：**作为卡片点击后的内容呈现方式**。

---

## 3. 方案收敛（多轮 demo 后倾向）

历经多轮：纯全息镭射（R3 自研）→ 用户反馈"有点丑"（照片被 `color-dodge` 搅脏）→ 改用照片视差（R4）→
最终把 R4 + R5 + R6 三种机制**融合为一套卡牌**。

### 3.1 推荐形态：宝可梦框 + 照片视差 + 聚焦滤镜 + 翻面

| 层 | 内容 | 来源机制 | 说明 |
|---|---|---|---|
| 外框 | 彩色边框 + 浅色卡面 | 用户既定版式 | 每卡一个 `--frame`，暗部渐变用 `color-mix` 派生 |
| 图片区 | 照片视差深度 + soft-light 光泽 | R4 | **替掉镭射**，不破坏照片 |
| 扫视节奏 | 未 hover 灰化，hover 全彩 | R5 | 一排卡的导视 |
| 点击行为 | 3D 翻面显示背面文字 | R6 | 深色背面色派生自 `--frame` |

代码雏形已多次内联在聊天（零依赖 CSS + 原生 JS，几十行；背面深色卡面 + 正面浅卡面）。

### 3.2 关键实现点（沉淀）

- **翻面与倾斜共存**：`transform: rotateX(var(--rx)) rotateY(calc(var(--flip) + var(--ry)))`，
  `--flip` 0↔180deg 由点击切换，`--rx/--ry` 由光标驱动。
- **滤镜作导视**：默认 `grayscale(.55) brightness(.85)`，hover/focus 恢复全彩。
- **温和混合**：光泽/高光用 `soft-light`（或 `overlay`），不用 `color-dodge`/`screen` 强混合，避免脏片。
- **无障碍**：`tabindex` + 键盘（Enter/空格）翻面；`prefers-reduced-motion` 关倾斜/视差/动画（翻面作为
  内容切换保留）；`pointer: coarse`（触屏）不倾斜、不作 hover 灰化。
- **翻面为内容切换非装饰**：故 reduced-motion 下保留翻面，只关装饰动画。
- 视差背景需放大（`inset` 负值）到约 124%，平移时不露边。

### 3.3 许可红线（跨会话有效）

- R3 `pokemon-cards-css` **GPL-3.0 + Svelte**：不复制、不并码。
- R1 CodePen 编辑器：专有 + 登录墙，不扒。
- R4/R5/R6：未标注许可，但**只采纳通用机制、从零重写**，不抄其 HTML/CSS/JS 原文；不引入 Vue / unsplash 外链。
- R2 CSS-Tricks：唯一明确允许直接取用代码/设计的参考源，但只借鉴信息层级与语义化。

---

## 4. 尚未定夺、阻塞正式设计文档的开放项

正式 `docs/design/`（作为可批准实现的设计文档）仍需澄清以下几点——它们不在本次"整理"范围，但必须
在下一份设计文档里给出答案：

1. **点击行为**：保留需求原稿三段式（放大→翻面→返回），还是用 R6 的单次点击直接翻面？倾向后者。
2. **卡片数量与内容**：几张卡、分别是什么兴趣？
3. **图片**：有没有现成素材？图片放哪（`src/assets/interests/` 走 Astro 优化 vs `public/media/`）？
   统一比例建议 4:3 或 1:1。
4. **是否双语**：Interests 目前中英两页，卡片内容是否需 `title.zh/en`。
5. **层级**：需求提到的"兴趣种类 → 更具体分类"多级结构，与当前 Interests 单页实现（`[...slug]` 缺失）
   的关系——若要子页需先改路由（属代码改动，需授权）。

---

## 5. 明确不做 / 不引入

- 不引入任何运行时 JS 框架（Vue/React/Svelte）、Tailwind、Canvas。
- 不引入 `pokemon-cards-css`、`hover-tilt` 等新 npm 依赖（除非用户明确批准）。
- 不扒 CodePen 专有 bundle 源码。
- 不使用外部 CDN 照片（unsplash 等）；照片只来自本站素材。
- 本调研文档不构成实现授权；`docs/design/` 正式设计文档获用户批准前，不改 `src/`。
