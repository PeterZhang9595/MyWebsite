# 网站架构与维护接口

## 文档状态

- 当前版本：网站基础版本
- 验收日期：2026-09-04
- 适用部署：GitHub Pages 项目站点 `/MyWebsite/`
- 相关设计：[网站基础版本设计](../design/2026-09-03-website-setup.md)
- 实现记录：[网站基础版本记录](../records/2026-09-03-website-setup.md)

本文档描述已经验收的网站现状。它用于后续维护，不代替原始需求或历史记录。

## 1. 总体架构

网站使用 Astro 静态生成。页面在构建阶段读取 Markdown、MDX、JSON 和 Git 历史，输出到 `dist/`；Pagefind 随后为输出目录建立静态搜索索引。浏览器端只运行 Bio、主题、搜索、句子切换、代码复制和预留媒体交互所需的少量原生脚本。

```text
src/content/ + src/data/ + src/site.config.ts
                    ↓
         内容校验、日期和双语映射
                    ↓
        页面组件、布局、SEO 元数据
                    ↓
              Astro 静态构建
                    ↓
             dist/ 静态页面
                    ↓
          Pagefind 生成搜索索引
```

网站没有服务端运行时、数据库、账户系统、客户端路由或全局状态框架。JavaScript 不可用时，导航、正文、默认 Bio 和浅色主题仍可使用。

## 2. 目录职责

| 路径 | 当前职责 | 主要修改入口 |
| --- | --- | --- |
| `src/pages/` | 中英文公开路由和静态参数生成 | 新增栏目或改变公开 URL 时修改 |
| `src/layouts/` | HTML 外壳、SEO、主页双栏和内容页骨架 | 改变全站结构时修改 |
| `src/components/` | 资料区、导航、搜索、内容目录和媒体交互 | 调整局部界面或交互时修改 |
| `src/content/` | Bio、Notes、Tips、Projects、Interests 正式内容 | 日常内容维护入口 |
| `src/data/` | 近期关注、随机句子和音乐数据 | 日常本地数据维护入口 |
| `src/i18n/` | 语言类型、界面短文本和栏目路由 | 新增界面词条或语言时修改 |
| `src/lib/` | 内容仓库、日期、翻译、URL、SEO 和状态逻辑 | 改变规则或公共接口时修改 |
| `src/styles/` | 设计变量、全局布局和文章排版 | 调整视觉系统时修改 |
| `src/assets/` | 由 Astro 处理和优化的图片 | 头像、文章图片等需要构建优化的资源 |
| `public/` | 保持原路径发布的静态文件 | robots、分享图和未来音视频 |
| `scripts/` | 分享图和 Playwright 测试站点脚本 | 构建维护工具 |
| `tests/` | 单元、集成、浏览器测试、fixture 和临时证据 | 所有测试代码与测试数据 |
| `.github/workflows/` | CI 和 GitHub Pages 部署 | 改变远程检查或部署流程时修改 |

根目录 `assets/` 保存原始素材及其授权说明，不直接发布。根目录原始 `avatar.jpg` 已迁移为 `src/assets/profile/avatar.jpg`，因此工作树中显示根文件删除属于本次实现的一部分。

## 3. 路由结构

中文是默认语言，英文统一位于 `/en/` 下。Astro 配置中的 `base` 为 `/MyWebsite`，但页面展示的终端路径不会显示这一部署前缀。

| 页面 | 中文路由 | 英文路由 | 源码入口 |
| --- | --- | --- | --- |
| 首页 | `/` | `/en/` | `src/pages/index.astro`、`src/pages/en/index.astro` |
| Notes 首页 | `/notes/` | `/en/notes/` | 两个明确的 `notes/index.astro` |
| Notes 详情 | `/notes/**` | `/en/notes/**` | `[...slug].astro` |
| Tips 首页 | `/tips/` | `/en/tips/` | 两个明确的 `tips/index.astro` |
| Tips 详情 | `/tips/:slug/` | `/en/tips/:slug/` | `[slug].astro` |
| Projects 首页 | `/projects/` | `/en/projects/` | 两个明确的 `projects/index.astro` |
| Projects 详情 | `/projects/:slug/` | `/en/projects/:slug/` | `[slug].astro` |
| Interests | `/interests/` | `/en/interests/` | 两个明确的 `interests/index.astro` |
| 404 | `/404.html` | 同一双语页面 | `src/pages/404.astro` |

Notes 支持多层目录。Tips 和 Projects 的首版公开路由是单层详情页，新增更深层级前需要先把对应路由改为 catch-all 并补充测试。

## 4. 布局与页面组合

`src/layouts/BaseLayout.astro` 负责：

- HTML 语言、标题、描述、canonical、Open Graph 和 JSON-LD；
- 真实译文的 `hreflang`；
- 首次绘制前恢复主题；
- 全站工具栏、搜索对话框、跳转到正文链接和页面宽度外壳。

`src/layouts/HomeLayout.astro` 只定义主页左右两栏。主页本身组合 `TerminalPath`、`ProfileHeader`、`BioToggle`、Recent Focus、Tips、栏目入口和 `PersonalMedia`。

`src/layouts/ContentLayout.astro` 负责内容页路径、标题、描述和文章容器，并为代码块添加复制按钮。栏目页与详情页的公共实现位于 `src/components/pages/`：

- `SectionIndexPage.astro`：Notes、Tips、Projects 栏目首页；
- `ContentItemPage.astro`：目录、文章、Tip 和 Project 详情；
- `InterestsPage.astro`：首版单长页兴趣内容。

## 5. 内容仓库与校验

`src/content.config.ts` 为每种内容和语言建立独立 collection，例如 `notesZh` 与 `notesEn`。这样相同公共 slug 可以同时存在于中英文内容中，又不会发生 Astro collection ID 冲突。

`src/lib/content-schema.ts` 定义公共字段和栏目扩展字段。核心规则包括：

- `lang` 只能为 `zh` 或 `en`；
- `slug` 只能使用小写英文、数字、连字符和 `/`；
- `draft` 默认是 `true`；
- Project 状态只能为 `active`、`completed` 或 `archived`；
- Tips 必须提供整数 `order`；
- URL、日期和图片字段在构建阶段校验。

`src/lib/content-repository.ts` 是页面读取内容的统一接口：

- `loadPublicContent(section, lang)` 过滤草稿、校验语言和栏目 slug、拒绝重复 slug、解析日期并稳定排序；
- `findTranslatedItem(...)` 按 `translationKey` 查找真实译文；
- `directChildren(...)` 只返回一个目录的直接子目录和直接子文章。

测试构建设置 `TEST_CONTENT_FIXTURES=1` 时，collection 根目录切换到 `tests/fixtures/content/`，输出和 Astro cache 也进入 `tests/artifacts/`，不会污染正式内容或正式 `dist/`。

## 6. 双语与译文回退

界面短文本位于 `src/i18n/ui.ts`，栏目路径位于 `src/i18n/routes.ts`。内容自身的 `lang` 决定所属语言；可选 `translationKey` 只表示两份内容互为真实译文。

语言按钮规则：

1. 首页和栏目首页直接切换到另一语言的对应页面；
2. 内容存在相同 `translationKey` 时切换到对应详情；
3. 没有译文时回退到目标语言的同栏目首页；
4. 只有真实译文才生成 `hreflang`，栏目回退不会伪装成译文。

当前没有运行时 AI 翻译。译文由用户分别维护。

## 7. URL 与 GitHub Pages 基础路径

`src/lib/urls.ts` 集中管理 URL：

- `withBase(path)` 为内部路径加入 `/MyWebsite`，并保证目录尾斜杠；
- `localDataHref(href)` 为 JSON 中以 `/` 开头的站内链接加入 base，同时保留完整外部 URL；
- `contentPath(lang, slug)` 生成不含部署 base 的语言内容路径；
- `canonicalUrl(path)` 组合正式站点地址与 base。

新增内部链接时必须使用这些 helper 或已经返回正确语言路径的 i18n helper，不能直接假定网站部署在域名根路径。Astro 的 `site` 和 `base` 同时固定在 `astro.config.mjs` 与 `src/site.config.ts` 的相应配置中；修改仓库名或域名时应同步调整并运行部署级测试。

## 8. 日期来源

`src/lib/git-dates.ts` 通过 `git log --follow` 获取内容文件历史：

- 最早提交时间作为发布时间；
- 最近提交时间作为更新时间；
- `publishedAtOverride` 和 `updatedAtOverride` 优先于 Git；
- 同一构建内缓存查询结果；
- 已发布内容既没有覆盖日期也没有 Git 历史时构建失败。

CI 和部署 workflow 因此使用完整历史 checkout（`fetch-depth: 0`）。未提交的新内容在发布前应保持 `draft: true`，或者临时提供明确的覆盖日期。

## 9. 本地数据接口

`src/lib/local-data.ts` 在构建阶段校验三个 JSON 文件：

- `src/data/recent-focus.json`：`id`、中英文标题、可选说明、可选 URL、`order`；站内 URL 在页面输出时统一经过 `localDataHref`；
- `src/data/quotes.json`：`id`、`text`、可选作者和来源、文本语言；
- `src/data/music.json`：`id`、曲名、作者、本地音频路径、可选封面、版权和来源 URL。

这些数据不通过网络获取。音乐文件未来放在 `public/media/audio/`，但必须先核对版权和仓库体积。

## 10. 搜索、SEO 与构建顺序

生产构建命令是：

```powershell
pnpm run build
```

实际顺序为：

1. `astro build` 输出静态页面、资源、sitemap、robots 引用和元数据；
2. `pagefind --site dist` 为正式输出建立搜索索引。

搜索对话框在用户首次使用时按需加载 `/pagefind/pagefind.js`，并使用 `lang` filter 只返回当前语言结果。Bio、工具栏、媒体装饰和目录重复摘要不进入索引。搜索加载失败时显示本地化不可用状态。

首页输出 `Person` JSON-LD；内容文章输出 `Article` JSON-LD。当前只使用一张静态分享图 `public/social/default.png`，没有 RSS 或动态文章分享图。

## 11. 依赖边界

运行依赖集中在 Astro、MDX、Sitemap、Markdown/KaTeX 管线、Lucide 和 Sharp；开发依赖集中在类型检查、Pagefind、Vitest、Playwright 与 axe。版本全部精确锁定在 `package.json` 和 `pnpm-lock.yaml`。

当前明确不包含 React、Vue、Tailwind、组件库、客户端状态框架、完整 i18n 框架、数据库和服务端 API。新增依赖前应说明长期维护收益、体积、许可证和替代方案，并按开发策略重新获得授权。

## 12. 构建、测试与部署接口

常用本地命令：

```powershell
pnpm run dev
pnpm run check
pnpm run test:unit
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:webkit
pnpm run test:all
```

`.github/workflows/ci.yml` 在 Pull Request 和 `main` 推送时检查项目；`.github/workflows/deploy.yml` 在 `main` 推送或手动触发时重新检查并部署 `dist/`。首次上线仍需用户在 GitHub Pages 设置中将 Source 选择为 GitHub Actions，详见[部署说明](../deployment/2026-09-03-github-pages.md)。

## 13. 当前限制

- GitHub Pages 已于 2026-09-04 成功部署，当前公开地址为 <https://peterzhang9595.github.io/MyWebsite/>；
- 当前 Windows 主机的 Playwright Firefox 启动会返回 `spawn UNKNOWN`；Chromium 和 WebKit 已通过，CI 的 Ubuntu 环境仍可继续覆盖 Chromium；
- 插画、视频和音乐使用可扩展外壳，目前没有正式媒体；
- 首页 Bio、Tips、Recent Focus、随机句子和栏目说明仍包含已明确标注的助手临时排版文字，替换方式见[内容创作指南](content-authoring.md)。
