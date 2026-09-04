# 网站基础版本设计文档

## 文档状态

- 日期：2026-09-03
- 状态：已按批准设计实现，并于 2026-09-04 通过用户最终验收
- 范围：个人主页首个可部署版本
- 原始需求：[2026-09-03-website-setup.md](../requirements/2026-09-03-website-setup.md)
- 开发流程：[开发策略](../development/strategy.md)
- 测试规则：[测试策略](../testing-strategies/2026-09-03-testing-strategy.md)

本文档汇总原始需求和聊天中已经确认的全部决定，是后续实现所依据的设计规范。本文档本身不授权修改源代码、依赖、测试、构建配置、部署配置或 Git 历史。

## 1. 产品目标

网站是 Peter Zhang 准备长期维护的个人主页，用于展示个人信息、近期关注、核心观点、学习笔记、项目和兴趣内容。首版的重点是建立可靠基础，而不是尽可能多地堆叠功能。

网站必须满足：

- 使用静态生成，可部署到 GitHub Pages；
- 中文为默认语言，英文为第二语言；
- 内容优先，关键内容在可选 JavaScript 失效时仍然可用；
- 具有个人辨识度，但不成为通用终端主题或组件仪表盘；
- 用户可以通过 Markdown、MDX、JSON 和少量集中配置长期维护；
- 内容、路由、交互、渲染和部署均具有可重复验证方式。

## 2. 参考网站与借鉴边界

### 2.1 Lee Robinson

参考：<https://leerob.com/>

借鉴：

- 较宽的阅读栏与较窄的 sticky 视觉栏；
- 强调字体、留白和克制的结构线；
- `Default / Long` Bio 完整替换交互；
- 安静的文章阅读层级；
- 动画不可用时退化为静态图片的媒体区域。

2026-09-03 实际检查到的字体策略：

- 正文字体优先使用本地 `Iowan Old Style`，缺失时退回 Palatino 和 Georgia；
- 界面字体使用系统无衬线字体；
- 代码使用系统等宽字体。

不得复制 Lee Robinson 的插画、文章、源代码或未授权字体文件。`Iowan Old Style` 仅作为本地字体名称使用，在没有再分发许可时不得打包进仓库。

### 2.2 Arthals' ink

参考：<https://arthals.ink/>

借鉴：

- 圆形头像、姓名、所在地和 GitHub 组成的居中个人资料区；
- Education 区域的清晰链接行；
- 图标化搜索入口与紧凑页面工具。

这些原则需要适配到本站的字体、内容结构和双栏布局中，不得整页照搬。

### 2.3 音乐播放器参考

参考：<https://letere-gzj.github.io/hugo-stack/p/hugo/custom-player/>

只借鉴紧凑、可收缩播放器的交互概念。首版不复制其代码、图片或音频。

## 3. 视觉方向

### 3.1 设计主张

网站采用“编辑式阅读页面 + 一处明确技术符号”的组合。主要内容保持安静、留白充分，终端路径提示符作为唯一主要视觉冒险，避免整站变成常见的黑客终端模板。

主页首要表达的是用户身份和内容入口，而不是营销标语。个人资料区和路径提示共同说明“这是谁的网站”和“内容如何组织”。

### 3.2 标志性路径提示符

页面顶部显示类似：

```text
peter@website:/root/笔记/cs285/第三篇$
cd ..
```

规则：

- 首页为 `peter@website:/root$`；
- 所有页面由 `TerminalPath` 渲染的第一行面包屑/提示符都使用贴合文字宽度的极浅纸张黄色背景（浅色固定为 `#fff9df`）；深色主题使用低饱和暗暖色 `#302c22`；
- 已经过的每一级路径可以点击；
- 当前页面名称不可点击；
- `cd ..` 作为第二行的父级返回命令；
- `cd ..` 不使用提示符的黄色背景；
- 显示路径可以使用中文，真实 URL 仍使用小写英文 ASCII slug；
- 界面不显示 GitHub Pages 的 `/MyWebsite` 基础路径；
- 长路径在窄屏安全换行；
- 不使用打字动画、闪烁光标或模拟命令执行效果。

### 3.3 配色：Paper and Graphite

浅色主题：

| 用途 | 色值 |
| --- | --- |
| 页面背景 | `#ffffff` |
| 主要文字 | `#282828` |
| 次要文字 | `#676767` |
| 轻微表面 | `#f3f3f2` |
| 分隔线 | `#e2e2df` |
| 焦点与少量强调 | `#6657c8` |

深色主题：

| 用途 | 色值 |
| --- | --- |
| 页面背景 | `#1b1a19` |
| 主要文字 | `#e8e5df` |
| 标题文字 | `#f4f1eb` |
| 次要文字 | `#aaa59e` |
| 轻微表面 | `#242321` |
| 分隔线 | `#3b3936` |
| 焦点与少量强调 | 经 AA 对比度测量后的浅紫色 |

实现时允许为了可访问性进行小幅对比度修正，但必须保留温暖石墨色关系。强调色只用于键盘焦点、链接反馈和少量有意义的状态。

### 3.4 字体

阅读和标题字体栈：

```css
"Iowan Old Style Local",
"Iowan Old Style",
"Palatino Linotype",
Palatino,
Georgia,
"Songti SC",
STSong,
SimSun,
serif
```

职责划分：

- 标题、Bio、Tips、Notes、Projects、Interests 和文章正文使用阅读字体；
- 路径、日期、标签、按钮、搜索和播放器界面使用系统无衬线字体；
- 行内代码和代码块使用系统等宽字体。

首版不下载通用网页字体。不同操作系统在 Iowan、Palatino、Georgia 和中文系统宋体之间产生的字形差异属于已接受的取舍。

### 3.5 结构与动效

- 左右主栏依靠留白分隔，不绘制竖直分割线；
- 栏目入口和技术内容块可以使用细中性边框；
- 普通重复内容默认不放入悬浮卡片；
- 圆角只用于媒体和紧凑播放器等明确对象；
- 动效只服务于 Bio 替换、主题反馈、搜索打开和媒体播放；
- `prefers-reduced-motion` 关闭非必要过渡和视频运动。

## 4. 主页设计

### 4.1 双栏结构

宽屏使用双栏：左栏约占 62%～68%，右栏约占 32%～38%。左栏随页面正常滚动，右栏在可用宽度充足时使用 sticky，栏间只使用留白。只有主阅读宽度、右栏最小可用宽度和栏间留白都能成立时才保留双栏。

### 4.2 左栏顺序

1. 终端路径和 `cd ..`；
2. 居中的个人资料区；
3. `Default / Long` Bio；
4. 并列的 Recent Focus 和 Tips；
5. Notes 大入口；
6. Projects 大入口；
7. Interests 大入口；
8. Copyright。

### 4.3 个人资料区

- 实现授权后使用用户提供的 `avatar.jpg`；
- 头像居中显示为圆形，带细中性边框和内部留白；
- `Peter Zhang` 位于头像下方，是资料区最强文字层级；
- 姓名字号比首轮预览更克制，不应压过头像和后续 Bio；
- 下一行并列所在地与 GitHub 两个图标化入口；
- 所在地为 `China / Beijing`；
- GitHub 地址为 <https://github.com/PeterZhang9595>；
- 最终图标来自统一图标系统，设计预览中的临时字符不作为正式资源。

### 4.4 Bio

- `Default` 和 `Long` 完整替换 Bio 正文；
- 当前状态在正文上方的紧凑控制行中标识；
- 切换使用短暂、轻微的淡入淡出；
- 状态不持久保存，刷新恢复 `Default`；
- 无 JavaScript 时显示 `Default`；
- 支持键盘与可见焦点；
- 当前语言缺少 Long Bio 时隐藏 Long 按钮；
- Bio 不进入 Pagefind 索引。

### 4.5 Recent Focus

- 由用户在 `src/data/recent-focus.json` 手动维护；
- 通常显示 3～5 条，按显式顺序排列；
- 可以链接到 Notes、Projects 或外部资源；
- 没有独立详情页；
- 每条包含标识符、中英文标题、可选中英文描述、可选 URL 和顺序。

### 4.6 Tips

- 表示核心价值观、方法和想法，与 Notes 没有交集；
- 首页显示当前语言全部已发布 Tips 的标题；
- 标题进入独立详情页；
- 使用公共内容字段并增加 `order`。

### 4.7 栏目大入口

Notes、Projects、Interests 采用编辑式目录入口：较大标题在左，数量或动作提示在右，简短说明位于下一行，整行可点击，使用细横线分隔，不使用填色卡片。

### 4.8 右栏：留白画廊

从上到下为随机句子、插画/视频主视觉、轻微叠在插画下缘的紧凑播放器。整个右栏内容相对顶部工具栏下移，保留明确呼吸空间。

随机句子：

- 来自 `src/data/quotes.json`；
- 中英文混合，不随站点语言过滤；
- 可包含 `text`、`author`、`source` 和 `lang`；
- 当前句子通过 `sessionStorage` 在标签页内保持；
- 点击后从本地数据更换；
- 中文操作文字为“换一个”，放在实际句子的右下方；
- 不请求外部服务。

插画与视频：

- 首版只实现克制占位和未来接口；
- 预留 `poster`、`videoWebm`、`videoMp4`、`alt`；
- 桌面精细指针悬停约 200ms 后播放，移出后停止并复位；
- 播放失败时保留封面；
- 移动端不下载视频；
- reduced motion 用户只看到封面；
- 未来视频放在 `public/media/illustration/`，优化封面放在 `src/assets/`。

播放器：

- 首版只实现可收缩外壳；
- 预留封面、曲名、作者、播放控制和进度位置；
- 无曲目时显示 `Playlist pending` 并禁用播放；
- 不自动播放，不使用第三方示例音乐；
- 未来数据来自 `src/data/music.json`，音频放入 `public/media/audio/`；
- 曲目必须记录来源与版权；
- 跨页面连续播放延后。

### 4.9 右上工具栏

顺序为语言、主题、搜索。语言控件显示 `中 / EN`；主题和搜索使用线性图标与无障碍名称。桌面位于右上角，窄屏进入顶部工具行。默认无永久外框，交互状态使用轻微表面，并保留足够触控面积。

## 5. 响应式规则

- 窄屏时右栏移动到主内容之后并回归文档流；
- 移动端不请求视频；
- 播放器不得遮挡正文、导航或浏览器控件；
- Recent Focus/Tips 和栏目元数据在空间不足时堆叠；
- 路径换行，不产生页面级横向滚动；
- 代码只在自身内部横向滚动；
- 验证桌面、中间宽度和移动端三个尺寸。

## 6. 双语与路由

### 6.1 公共路由

```text
/                       中文首页
/notes/                 中文 Notes
/tips/                  中文 Tips
/projects/              中文 Projects
/interests/             中文 Interests
/en/                    英文首页
/en/notes/              英文 Notes
/en/tips/               英文 Tips
/en/projects/           英文 Projects
/en/interests/          英文 Interests
```

详情页遵循相同前缀，公开 slug 使用小写英文 ASCII。

### 6.2 源码路由

中英文各自使用明确、很薄的路由入口，共享布局和页面实现。不使用一个全能 catch-all 路由。Notes 详情使用 `[...slug].astro`，Tips 和 Projects 使用 `[slug].astro`。

### 6.3 翻译对应

- 每个内容有 `lang`，可以有 `translationKey`；
- 相同 `translationKey` 表示互为译文；
- 有译文时切换到对应详情；
- 无译文时切换到目标语言的同栏目首页；
- 搜索只返回当前语言；
- 不调用实时 AI 翻译；
- `hreflang` 只描述真实译文，不描述栏目回退。

### 6.4 界面词典

`src/i18n/config.ts`、`ui.ts`、`routes.ts` 管理语言、界面短文本和路由规则。不引入完整 i18n 框架。缺少必需词条时检查或构建失败。

## 7. 内容架构

### 7.1 目录

```text
src/content/
├─ bio/{zh,en}/
├─ notes/{zh,en}/
├─ tips/{zh,en}/
├─ projects/{zh,en}/
└─ interests/{zh,en}/
```

Notes 可任意嵌套，`_index.md` 描述目录。正式目录不放虚构示例，测试内容只放在 `tests/fixtures/`。

### 7.2 公共字段

```yaml
title:
description:
lang:
slug:
translationKey:
draft: true
tags:
cover:
publishedAtOverride:
updatedAtOverride:
```

- `draft` 默认 `true`；
- 文件位置与 `lang` 必须一致；
- slug 是不含语言前缀的稳定小写 ASCII 公共路径；
- 草稿不生成生产路由，不进入搜索和 sitemap；
- schema 拒绝无效语言、重复 slug、错误译文对应和无效项目状态。

### 7.3 Notes

- 目录页只列直接子目录和直接子文章；
- 不展开所有深层内容；
- 同级先按 `order`，再按标题，最后按 slug；
- Notes 与目录索引可以使用可选 `order`。

### 7.4 Projects

```yaml
status: active | completed | archived
technologies: []
repositoryUrl:
demoUrl:
order:
```

每个项目有独立详情页。

### 7.5 Interests

正式英文名与 URL 为 `Interests` 和 `/interests/`。首版每种语言一个长页面，未来可增加子页而不迁移 `_index.md`。

### 7.6 Bio 与本地数据

Bio 使用 Markdown；姓名、头像、所在地、GitHub、版权放在 `src/site.config.ts`；Recent Focus、句子和音乐分别放在 `src/data/recent-focus.json`、`quotes.json`、`music.json`。数据在检查或构建时验证。

## 8. 文章渲染

- Markdown 优先，只有复杂交互和自定义布局使用 MDX；
- MDX 组件通过统一注册入口提供；
- 采用“技术文档”视觉方案：代码和提示块边界清晰，颜色克制；
- 提示块使用 GitHub 风格 `[!NOTE]` 语法，支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`；
- 代码使用 Astro 内置 Shiki 构建时高亮，浅色和深色分别配置，提供语言标签和复制按钮；
- 数学使用 `remark-math`、`rehype-katex`、KaTeX；行内为 `$...$`，块级为 `$$...$$`；
- 不使用运行时 MathJax，不提供复杂代码标签页和逐行动画。

## 9. 搜索

- 直接使用 Pagefind，不使用 Astro 封装；
- Astro 构建后为 `dist/` 建索引；
- 搜索面板按需加载 Pagefind 浏览器 API；
- 过滤当前语言；
- 索引已发布的内容详情和 Interests；
- 排除 Bio、草稿、工具栏、媒体装饰及重复目录摘要；
- 支持右上角入口、`Ctrl/Command + K` 和 `Escape`；
- 关闭后恢复触发控件焦点；
- 生产构建预览是验收依据。

## 10. 主题

首次访问默认浅色，不跟随系统。用户选择写入 `localStorage`，页面可见绘制前读取以避免闪烁。无 JavaScript 时保持浅色；深色使用独立配色。

## 11. Git 日期

- 最早提交为首次发布时间，最近提交为更新时间；
- 覆盖字段优先，只用于迁移或特殊情况；
- 同一构建缓存查询；
- 未提交草稿可不显示日期；
- 已发布内容没有 Git 历史或覆盖日期时构建失败；
- CI 拉取完整历史。

## 12. GitHub Pages

```text
公开地址：https://peterzhang9595.github.io/MyWebsite/
site: https://peterzhang9595.github.io
base: /MyWebsite
```

所有链接、资源、canonical、Pagefind、sitemap 和测试必须尊重基础路径，由统一 URL helper 处理。

## 13. 基础 SEO

首版生成 title、description、canonical、文档语言、真实译文 `hreflang`、Open Graph、结构化数据、sitemap 和 `robots.txt`。首页使用 `Person` 数据，文章使用 Article 数据。首版使用一张静态分享图，不生成 RSS 或动态文章分享图。

## 14. 图标与客户端技术

- 使用 `@lucide/astro`，构建为静态 SVG，只导入使用的图标；
- 纯图标按钮有无障碍名称；
- 使用 Astro 组件和少量原生 TypeScript；
- 不引入 React、Vue、全局状态或客户端路由；
- 每个交互独立初始化并可静态退化。

## 15. 仓库边界

```text
assets/                     原始素材与授权记录
src/assets/                 Astro 优化图片
src/components/             页面和交互组件
src/content/                Markdown/MDX 内容
src/data/                   本地结构化数据
src/i18n/                   双语词典和路由
src/layouts/                布局
src/lib/                    内容、URL、日期等逻辑
src/pages/                  路由入口
src/styles/                 设计变量和样式
public/media/               原样发布媒体
scripts/                    构建维护工具
tests/                      所有测试与证据
docs/                       项目文档
.github/workflows/          CI 与部署
```

根 `assets/` 不直接发布；`src/assets/` 交给 Astro 优化；`public/` 只放需要稳定路径的文件。大型音视频加入前重新检查仓库体积和版权。根目录 `avatar.jpg` 只在明确实现授权后移动。

## 16. 首版内容规则

使用现有头像、姓名、所在地和 GitHub，不编造其他个人内容。缺少内容时显示本地化空状态；缺少 Long Bio 时隐藏按钮；三个本地数据文件可以为空；公开目录不创建示例文章，测试示例只在 `tests/fixtures/`。

实现开始后，用户明确批准在主页加入少量由助手编写的临时文字，用于验证中英文、长短段落和列表排版。这些文字不得被描述为用户的真实经历或正式观点，必须集中放在易替换的内容/数据文件中，并在交付验收时逐项列出文件位置和完整文本，由用户决定保留、修改或删除。

## 17. 依赖边界

直接依赖包括 Astro、MDX、官方 Markdown 管线、Sitemap、Pagefind、KaTeX 管线、Lucide、Sharp、Astro Check、TypeScript、Node 类型、Vitest、Playwright 和 axe-core。全部精确锁定。实现验证发现 Astro 7.3.0 的 Image 插件存在未公开内部模块导入回归，用户批准锁定到无该回归的 Astro 7.2.10。未经授权不得添加 Tailwind、React、Vue、组件库、状态管理、完整 i18n 框架、Pagefind 封装、MathJax 或无关工具。

`sharp`、`@types/node` 和 `@astrojs/markdown-remark` 是设计审阅后经用户明确批准增加的支撑依赖。

## 18. 部署

使用官方 GitHub Pages Actions，不使用 `gh-pages` 分支。流程包括完整历史 checkout、Node/Corepack、冻结安装、检查、测试、生产构建、Pagefind、上传 `dist/` 和部署。新部署取消旧的未完成部署。首次上线前用户在仓库 Pages 设置选择 GitHub Actions。

## 19. 测试

本需求属于 Level 5。执行 Astro/TypeScript 检查、生产构建、Vitest、Playwright、axe-core 和人工视觉/键盘检查。重点覆盖双语路由、Notes 层级、译文回退、路径、Bio、主题、搜索、句子、媒体退化、SEO 和 `/MyWebsite`。Chromium 跑完整套件，Firefox/WebKit 跑代表性 smoke。临时截图放在 `tests/artifacts/2026-09-03-website-setup/`，首版不建立自动视觉回归基线。

## 20. 失败与退化

无 JavaScript 时 Default Bio、导航、正文和浅色主题可用。Pagefind 失败显示不可用状态；视频失败保留封面；无音乐禁用控制；无译文回到目标栏目；无内容显示空状态；无日期的已发布内容构建失败。404 静态提供中英文首页入口。

## 21. 延后范围

AI 翻译、RSS、自定义域名、评论、分析、账户、服务端 API、动态分享图、跨页音频、临时媒体、自动视觉基线、通用前端框架、复杂代码演示、自动 Recent Focus 和 Interests 子页均不在首版。

## 22. 设计验收条件

只有在可重复构建、双语路由和基础路径正确、内容与日期规则正确、桌面/中间/移动布局符合设计、交互可键盘使用并安全退化、搜索/SEO/部署路径正确、测试证据完整、没有虚构内容或未授权媒体，并披露所有偏差后，才可交给用户验收。

