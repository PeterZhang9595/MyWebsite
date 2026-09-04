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

首版 Project 同样使用单层详情路由：

```markdown
---
title: 项目名称
description: 项目解决的问题与当前结果。
lang: zh
slug: projects/project-name
translationKey: project-name
draft: true
tags:
  - web
status: active
technologies:
  - Astro
repositoryUrl: https://github.com/example/project
demoUrl: https://example.com/
order: 1
---

## 背景

项目正文从这里开始。
```

`status` 必须是：

- `active`：持续开发；
- `completed`：已完成；
- `archived`：停止维护或仅保留记录。

`technologies`、`repositoryUrl`、`demoUrl` 和 `order` 可以省略。不要填写不存在的仓库或演示地址。

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

## 14. 音乐数据

当前 `src/data/music.json` 为空，因此播放器显示待添加状态。未来单曲结构：

```json
[
  {
    "id": "track-id",
    "title": "曲名",
    "artist": "作者",
    "src": "/media/audio/file.mp3",
    "cover": "/media/audio/cover.jpg",
    "copyright": "版权或授权说明",
    "sourceUrl": "https://example.com/source"
  }
]
```

只有具备明确使用权的音频才能加入。当前播放器只是首版外壳；加入曲目数据不等于完整播放、进度或跨页面连续播放已经实现。

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

`tests/fixtures/content/` 中的内容全部是自动化测试数据，不进入正式生产构建，无需改写为个人内容。
