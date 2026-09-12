# 2026-09-12 主页右栏下移与插画放大 实施记录

来源需求：[`docs/requirements/2026-09-03-website-setup.md`](../requirements/2026-09-03-website-setup.md)（第 46、48 行：插画/视频主视觉与其上方的随机句子）
对应设计：无（本次为既有版式的微调，未新建设计文档）
对应路线图：无（改动范围小，未单独建立路线图）
相关现状文档：[`docs/documents/visual-and-interaction-system.md`](../documents/visual-and-interaction-system.md) 第 4 节

> 本记录在用户明确要求“可以把右边的句子生成器和 illustration/video 往下移动一些，illustration video 稍微调大一些”后开始执行。

## 背景

上一轮移除音乐播放器后，右栏只剩随机句子与插画占位两件。用户希望右栏整体下移、插画略大。

改动只涉及 `src/styles/global.css` 三条规则，不涉及组件结构、数据、路由、i18n 或构建配置。

## 变更清单

| 位置 | 原值 | 新值 | 效果 |
|---|---|---|---|
| `.home-aside` `padding-top` | `clamp(5.5rem, 11vh, 8rem)` | `clamp(7rem, 14vh, 10rem)` | 右栏整体下移，与右上工具栏拉开更大距离 |
| `.illustration` `min-height` | `58vh` | `64vh` | 插画/视频主视觉在桌面变高 |
| `@media (max-width: 880px)` `.home-aside` `padding-top` | `2rem` | `2.5rem` | 单栏时右栏顶部间距同步略增 |
| `@media (max-width: 880px)` `.illustration` `min-height` | `280px` | `320px` | 单栏时插画同步略增 |

## 几何核验（不是只看源码）

用 `tests/artifacts/2026-09-12-aside-tuning/measure-aside.mjs` 对**已构建的 `dist/`** 起静态服务后测量真实布局：

| 视口 | 指标 | 改前 | 改后 |
|---|---|---|---|
| 1440×1000 | `.home-aside` `padding-top` | `110px` | **`140px`（+30px）** |
| 1440×1000 | `.quote` 顶边 y | `158px` | **`188px`** |
| 1440×1000 | `.illustration` 高度 | `580px` | **`640px`（+60px，约 +10.3%）** |
| 1440×1000 | 右栏是否仍能 sticky | 是 | **是**（右栏总高 `858.6px`，连同 `top: 3rem` 仍在 1000px 视口内） |
| 390×844 | `.illustration` 最小高度 | `280px` | **`320px`（+40px）** |

右栏在桌面仍是 `position: sticky`，`880px` 以下仍回到文档流（`position: static`），未被本次改动改变。

## 验证证据

测试级别：**Level 2（页面与样式变更）**。

| # | 检查 | 命令 | 结果 |
|---|---|---|---|
| 1 | 生产构建 | `node node_modules/astro/bin/astro.mjs build` | **通过**，39 个页面全部生成 |
| 2 | 产物样式核对 | 检索 `dist/_astro/*.css` | **通过**：`clamp(7rem,14vh,10rem)` 与 `min-height:64vh` 均在构建产物中 |
| 3 | 几何核验 | `node tests/artifacts/2026-09-12-aside-tuning/measure-aside.mjs` | **通过**，数值见上表 |
| 4 | 端到端浏览器回归 | `node scripts/run-playwright.mjs --project=chromium` | **83/83 通过**（含 axe 无障碍、响应式单栏、路由、搜索、SEO） |

截图存于 `tests/artifacts/2026-09-12-aside-tuning/`（临时产物，已 gitignore）：`homepage-light-desktop.png`、`aside-closeup-desktop.png`、`homepage-light-mobile.png`，另有测量原始结果 `measurement.json`。

## 未触碰的内容

- 组件结构：`PersonalMedia.astro`、`QuoteRotator.astro`、`IllustrationMedia.astro` 一字未改，随机句子的 sessionStorage 行为、插画视频的悬停播放逻辑均不变；
- 左栏与全站：左栏 `720px` 最大宽度、`home-grid` 列宽比例、工具栏、搜索层、`560px` 断点均未改；
- `docs/design/2026-09-03-website-setup.md` 等带日期的历史文档不改写，其中关于右栏构成的描述以现状文档为准。

## Git

本次未执行任何 Git 操作。改动为 `src/styles/global.css` 三条规则 + 现状文档一处 + 本记录；`dist/`、`.astro/`、`tests/artifacts/` 均为 gitignore 内产物，不进入版本历史。建议用户自行审阅 `git status` / `git diff` 后决定提交。
