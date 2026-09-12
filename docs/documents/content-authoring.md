# 内容创作与维护指南

## 文档状态

- 当前版本：网站基础版本
- 验收日期：2026-09-04
- 内容根目录：`src/content/`
- 本地数据目录：`src/data/`
- 架构说明：[网站架构与维护接口](website-architecture.md)

本文档给出当前实现能够直接使用的内容模板。正式内容由用户维护；测试样例只应放在 `tests/fixtures/content/`。

## 1. 推荐发布流程

1. 在正确语言目录中新建 `.md` 或 `.mdx` 文件；
2. 写作阶段保持 `draft: true`；
3. 运行 `pnpm run check` 和相关测试；
4. 提交文件，使 Git 能提供首次日期；
5. 将 `draft` 改为 `false` 并再次构建，或者在确有需要时提供覆盖日期；
6. 检查中英文切换、路径、搜索和移动端排版。

草稿不会生成生产路由，不进入 Pagefind，也不进入 sitemap。已经发布的文件如果没有 Git 历史或 `publishedAtOverride`，生产构建会失败，这是为了避免显示虚假的发布日期。

日期由 `src/lib/git-dates.ts` 解析，它读取 `git log --follow --format=%aI` 的全部提交，最早一条作为首次提交时间，最近一条作为最近更新时间。取值顺序如下：

| 输出 | 取值顺序 |
| --- | --- |
| `publishedAt` | `publishedAtOverride` → Git 首次提交时间 → 无来源且已发布则构建失败 |
| `updatedAt` | `updatedAtOverride` → Git 最近提交时间 → 与 `publishedAt` 相同 |

草稿的日期为 `null`，页面不渲染日期行。页面只在 `updatedAt` 与 `publishedAt` 不同时才显示“更新于”，因此刚发布的文章只显示“发布于”。`--follow` 会跟随文件重命名，但改名后首次提交时间也可能随之变化，需要时再用覆盖字段固定。

`.github/workflows/deploy.yml` 已设置 `fetch-depth: 0`，CI 构建能拿到完整 Git 历史。本地构建同样依赖本机仓库历史，克隆仓库时不要使用浅克隆。

## 2. 公共字段

除 Bio 外，内容使用以下公共字段：

```yaml
---
title: 页面标题
description: 用于目录摘要和 SEO 的简短说明
lang: zh
slug: notes/example
translationKey: example
draft: true
tags:
  - example
cover: ./cover.png
publishedAtOverride: 2026-09-04
updatedAtOverride: 2026-09-04
---
```

字段规则：

| 字段 | 必需 | 说明 |
| --- | --- | --- |
| `title` | 是 | 当前语言页面标题 |
| `description` | 是 | 非空摘要；同时用于 SEO description |
| `lang` | 是 | 只能是 `zh` 或 `en`，必须与所在目录一致 |
| `slug` | 是 | 不含 `/en` 和 `/MyWebsite`；使用小写英文、数字、连字符和 `/` |
| `translationKey` | 否 | 互为译文的内容使用相同值；没有译文时省略 |
| `draft` | 否 | 默认 `true`；只有确认发布后设为 `false` |
| `tags` | 否 | 字符串数组；当前主要作为内容元数据保留 |
| `cover` | 否 | 相对内容文件的图片，由 Astro 处理 |
| `publishedAtOverride` | 否 | 覆盖 Git 首次提交时间，只用于迁移或特殊情况 |
| `updatedAtOverride` | 否 | 覆盖 Git 最近提交时间，只用于特殊情况 |

不要为了让未提交内容通过构建而长期滥用日期覆盖字段。正常内容应尽量以 Git 历史为准。

## 3. Bio

文件位置：

```text
src/content/bio/zh/default.md
src/content/bio/zh/long.md
src/content/bio/en/default.md
src/content/bio/en/long.md
```

默认版模板：

```markdown
---
title: 默认简介
lang: zh
variant: default
draft: true
---

在这里写简短个人简介。
```

完整版本把 `variant` 改为 `long`。同一语言缺少已发布 Long Bio 时，主页会隐藏“完整”按钮。Bio 不需要 slug、译文键或日期，也不会进入搜索索引。

## 4. Notes 目录首页

Notes 使用 `_index.md` 表示目录。中文根目录示例：

```markdown
---
title: 笔记
description: 我的学习笔记与技术记录。
lang: zh
slug: notes
translationKey: notes-root
draft: true
tags: []
order: 1
---

这里可以写 Notes 栏目说明。
```

嵌套目录示例文件 `src/content/notes/zh/machine-learning/_index.md`：

```markdown
---
title: 机器学习
description: 机器学习课程与实践记录。
lang: zh
slug: notes/machine-learning
translationKey: notes-machine-learning
draft: true
tags: []
order: 10
---

这里可以写目录介绍。
```

目录页只列出直接子目录和直接子文章，不会展开全部后代内容。

## 5. Note 文章

文件可以任意嵌套，例如 `src/content/notes/zh/machine-learning/policy-gradient.md`：

```markdown
---
title: 策略梯度笔记
description: 对策略梯度基本推导的整理。
lang: zh
slug: notes/machine-learning/policy-gradient
translationKey: policy-gradient
draft: true
tags:
  - reinforcement-learning
order: 20
---

正文从这里开始。
```

文件夹层级和 slug 层级应保持一致，便于长期维护。`order` 可省略；省略后排在显式排序内容之后，再按标题和 slug 排序。

## 6. Tip

Tip 表示核心价值观、方法或想法，与 Notes 分开。首版使用单层详情路由，文件示例为 `src/content/tips/zh/understand-before-tools.md`：

```markdown
---
title: 先理解问题，再选择工具
description: 对问题理解与工具选择关系的简短说明。
lang: zh
slug: tips/understand-before-tools
translationKey: understand-before-tools
draft: true
tags:
  - method
order: 1
---

在这里写完整 Tip 内容。
```

`order` 必填。首页只显示已发布 Tip 的标题，点击后进入详情页。

## 7. Project

Project 使用 catch-all 路由 `src/pages/projects/[...slug].astro`，**支持任意层级嵌套**。栏目首页按种类分区展示卡片墙，每个项目既可以是单页，也可以是带子页的目录。

### 7.1 字段

```yaml
---
title: 项目名称
description: 项目解决的问题与当前结果。
lang: zh
slug: projects/project-name
translationKey: project-name
draft: true
tags:
  - web
category: personal-tool          # 必填，五选一
status: active                   # 必填
technologies:
  - Astro
repositoryUrl: https://github.com/example/project
demoUrl: https://example.com/
cover: ../../../../assets/projects/project-name.jpg
order: 1
---
```

`status` 必填，取值为：

- `active`：持续开发；
- `completed`：已完成；
- `archived`：停止维护或仅保留记录。

`category` 必填，取值为下表中的一种。缺了会直接构建失败，这是为了保证目录页的分区永远整齐。

| `category` | 中文分区标题 | 英文分区标题 |
| --- | --- | --- |
| `course-assignment` | 课程大作业 | Course assignments |
| `personal-tool` | 自用小项目 | Personal tools |
| `competition` | 比赛项目 | Competitions |
| `research` | 科研项目 | Research |
| `large-project` | 大型项目 | Large projects |

分区的自上而下顺序、schema 校验、组件渲染都从 `src/lib/project-categories.ts` 的 `projectCategories` 数组取值。**新增一种分类只需要在这个数组里插入一项并补上中英标签**，其余地方会自动跟随。空分组不会渲染标题。

`technologies`、`repositoryUrl`、`demoUrl`、`cover` 和 `order` 可以省略。不要填写不存在的仓库或演示地址。

`cover` 是相对当前 `.md` 文件的路径，走 Astro 图片优化。从 `src/content/projects/zh/` 下引用 `src/assets/projects/` 里的图片要写 `../../../../assets/projects/xxx.jpg`（四级向上）。有封面时卡片显示图片，没有封面时卡片自动降级为无图样式。

### 7.2 栏目首页

栏目首页需要 `src/content/projects/{zh,en}/_index.md`，`slug` 必须恰好是 `projects`。它本身也要带 `category` 和 `status`（因为共用 Project schema），这两个值只用于通过校验，不会显示在页面上。

首页会把所有已发布的一级项目按 `category` 分组，每组内按 `order` → 标题 → slug 排序。卡片点击后进入对应项目页。

### 7.3 单页项目与目录项目

**单页项目**：一个 `.md` 文件，正文写完即可。详情页顶部会渲染 `project-facts`（状态、技术栈、Repository / Demo 链接）。

**目录项目**：建一个文件夹，里面放 `_index.md`，子页随便命名。以 `projects/large-platform` 为例：

```text
src/content/projects/zh/
├── _index.md                       slug: projects
├── ml-coursework.md                slug: projects/ml-coursework
└── large-platform/
    ├── _index.md                   slug: projects/large-platform
    ├── features.md                 slug: projects/large-platform/features
    └── dev-log.md                  slug: projects/large-platform/dev-log
```

目录页（`_index.md`）与普通文章页的区别是：只有文件名是 `_index.md` 才会被识别为目录页，并额外做两件事——

1. 列出直接子项；
2. 在标题下渲染「入口」区块。

### 7.4 固定入口区块

项目目录页会在标题下渲染一排入口，顺序固定，由 `src/lib/project-entries.ts` 生成：

| 入口 | 出现条件 | 类型 |
| --- | --- | --- |
| 代码仓库 | frontmatter 有 `repositoryUrl` | 外链 |
| Demo | frontmatter 有 `demoUrl` | 外链 |
| 核心功能 | 存在 slug 为 `<项目 slug>/features` 的已发布子页 | 站内链接 |
| 开发过程 | 存在 slug 为 `<项目 slug>/dev-log` 的已发布子页 | 站内链接 |

**子页不存在时对应入口不会渲染**，所以不会出现死链。想启用某个入口，就建一个对应 slug 的子页；不想启用，不建即可。

这两个 key（`features` / `dev-log`）定义在 `projectChildPages`，改标签文案在那里改。

### 7.5 关于层级

嵌套层数没有限制，`projects/a/b/c` 也能正常生成路由。但要注意：**想让哪一层可访问，那一层就得有 `_index.md`**，否则该层 URL 会 404，而且面包屑里指向它的链接会变成死链。

子页同样要写 `category` 和 `status`（建议与主项目保持一致）。

### 7.6 视觉表达（自动）

本轮增强不要求作者手写视觉，由 schema + 内容自动渲染：

- **状态三色**：取自 `status`。`active` 蓝色波纹、`completed` 绿色、`archived` 红色。颜色令牌见 `src/styles/tokens.css`（`--status-active/completed/archived`），深浅主题自动适配。
  - **详情页**：标题下 `.project-facts` 渲染波纹状态灯（中心点 + 两个延时扩散环）+ 状态文字标签（中文/英文按 `lang` 切换）。
  - **目录卡片**：**不再渲染状态角标**（2026-09-10 迭代移除，卡片左上角那颗 8px 圆点已删）。状态信息只在详情页呈现，目录页不显示。
- **技术栈图标**：`technologies` 数组里写出的技术名，如果命中 `src/data/tech-icons.ts` 的收录表（Simple Icons），会内联渲染对应品牌 SVG 图标（构建期内联、零运行时请求）。未收录的技术回退为纯文本，不会伪造品牌图标。当前已收录：Python、Go、TypeScript、Astro、PyTorch。新增技术请同时把 SVG path 补进 `src/data/tech-icons.ts` 并注明许可来源。
- **散点背景氛围层**：仅项目栏目首页（`/projects/`、`/en/projects/`）渲染，其他栏目不渲染。
  - **全视口固定背景**：`position: fixed; inset: 0`，铺满整个浏览器视口（含左右留白与页脚区），滚动时静止不动。
  - **数量 1500**、直径 2–4.5px、不透明度 0.12–0.26；固定种子伪随机（LCG），构建期静态渲染，零运行时 JS / Canvas。
  - 缓慢浮动动画只动画 `transform`（GPU 合成）；`prefers-reduced-motion: reduce` 时完全关闭。
  - 采样逻辑抽在 `src/lib/atmosphere-dots.ts`（可单测）；调整参数见该文件与设计文档。
- **卡片通透度**：卡片底色 `color-mix(in srgb, var(--bg) 25%, transparent)`、底栏 `35%`，底层散点可透过卡片显示（卡片内点强度约为卡片外的 91%）。底栏与图片之间保留 1px 分界线（`border-top: var(--divider)`）；无封面图的 bare 卡片不显示该分界线。
- **卡片 hover**：悬停时整卡 `filter: saturate(.35) brightness(.985)`、标题文字变 `var(--muted)`、轻微下沉 1px；不变紫边框（这与一轮设计 §6.2 的旧决策相反，是迭代修正）。

## 8. Interests

首版每种语言只有一个长页面。建议使用 `src/content/interests/zh/_index.md`：

```markdown
---
title: 兴趣
description: 工作之外值得长期保留的兴趣记录。
lang: zh
slug: interests
translationKey: interests-root
draft: true
tags: []
order: 1
---

## 音乐

在这里写内容。

## 游戏

在这里写内容。
```

以后需要 Interests 子页时，应先扩展路由和目录页实现，再添加子内容，避免创建暂时无法访问的文件。

## 9. 中英文译文

英文文件放入相同栏目的 `en/` 目录，使用同一公共 slug 结构和相同 `translationKey`：

```yaml
lang: en
slug: tips/understand-before-tools
translationKey: understand-before-tools
```

文件名不要求完全相同，但保持一致更容易维护。若中文内容暂时没有英文版，省略 `translationKey` 或不要创建错误对应；语言按钮会回到英文同栏目首页。

## 10. Markdown、代码、提示块和数学

普通写作优先使用 `.md`。只有需要 Astro/组件表达能力时才使用 `.mdx`；当前 `src/components/content/mdx-components.ts` 尚未注册自定义组件。

代码块：

````markdown
```ts
const answer = 42;
```
````

构建阶段由 Shiki 高亮，页面会提供复制按钮。行内代码使用单个反引号。

GitHub 风格提示块支持 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`：

```markdown
> [!NOTE]
> 这里是补充说明。
```

数学公式：

```markdown
行内公式 $E = mc^2$。

$$
\nabla_\theta J(\theta)
$$
```

KaTeX 在构建阶段渲染，不需要浏览器运行 MathJax。

## 11. 图片与媒体

- 与文章一起维护、需要 Astro 优化的图片：放在内容文件附近或 `src/assets/`，通过相对路径引用；
- 需要稳定原始 URL 的视频和音频：放在 `public/media/`；
- 原始素材与许可证：放在根目录 `assets/`；
- 大型媒体加入仓库前必须重新评估体积、加载策略和版权。

Markdown 图片示例：

```markdown
![替代文字](./diagram.png)
```

替代文字应描述图片提供的信息，而不是只写“图片”。

## 12. Recent Focus

维护 `src/data/recent-focus.json`：

```json
[
  {
    "id": "topic-name",
    "title": {
      "zh": "中文标题",
      "en": "English title"
    },
    "description": {
      "zh": "可选中文说明",
      "en": "Optional English description"
    },
    "url": "/notes/topic-name/",
    "order": 1
  }
]
```

`url` 可以省略，也可以是完整外部 URL 或以 `/` 开头的站内路径。站内路径会自动加入 GitHub Pages 的 `/MyWebsite` base；数据中只写公开站内路径，例如 `/notes/topic-name/`，不要手动写 `/MyWebsite`。

## 13. 随机句子

维护 `src/data/quotes.json`。所有语言的句子放在同一数组，不按站点语言过滤：

```json
[
  {
    "id": "quote-id",
    "text": "句子正文",
    "author": "可选作者",
    "source": "可选来源",
    "lang": "zh-CN"
  }
]
```

当前界面只显示 `text`，但保留作者和来源字段供后续扩展。不要录入来源不明且可能存在版权问题的大段文字。

## 14. 音乐数据（已移除）

音乐播放器及其数据接口已于 2026-09-12 移除：`src/data/music.json`、`musicSchema`、`loadMusic()` 和 `public/media/audio/` 均已删除。不要再按曲目结构写入该文件，也不要把音频放进 `public/media/`。

将来若要恢复播放器，需要重新建立 schema、数据文件和浏览器测试，不能假定旧接口仍然存在。决策记录见 [`docs/records/2026-09-12-remove-music-player.md`](../records/2026-09-12-remove-music-player.md)。

## 15. 当前需要替换的临时文字

以下正式构建文件含有助手为排版验证编写的临时文字，不应被当作用户的最终经历或观点：

- `src/content/bio/zh/default.md`
- `src/content/bio/zh/long.md`
- `src/content/bio/en/default.md`
- `src/content/bio/en/long.md`
- `src/content/tips/zh/understand-before-tools.md`
- `src/content/tips/en/understand-before-tools.md`
- `src/data/recent-focus.json`
- `src/data/quotes.json`
- `src/pages/index.astro` 与 `src/pages/en/index.astro` 中三个栏目入口说明
- `src/site.config.ts` 中的默认站点简介
- 媒体组件中的空状态文案
- `src/content/projects/{zh,en}/` 下的全部项目（含 `_index.md` 与 `large-platform/` 子页），
  它们是 2026-09-09 为验证分区卡片墙与嵌套路由创建的占位内容
- `src/assets/projects/large-platform.jpg`，占位封面图（脚本生成的抽象图形，非真实截图）

`tests/fixtures/content/` 中的内容全部是自动化测试数据，不进入正式生产构建，无需改写为个人内容。
