# 网站基础版本实现路线图

> **供执行代理使用：**必须使用 `superpowers:executing-plans`，逐任务执行本路线图。除非用户明确要求委派，否则不得使用子代理。使用本文复选框记录进度。

**目标：**构建 Peter Zhang 个人主页的首个可部署双语 Astro 版本，完成内容集合、已批准的主页与文章设计、静态搜索、风险分级测试和 GitHub Pages 部署。

**架构：**Astro 静态生成中文根路由和 `/en/` 英文路由。薄路由入口复用共享布局、经过验证的内容仓库、轻量 i18n 和独立原生 TypeScript 交互。Git 日期在构建期读取，Pagefind 在 Astro 构建后建立索引，GitHub Actions 发布 `dist/`。

**技术栈：**Node.js 24.20.0、pnpm 11.25.0、Astro 7.2.10、TypeScript 6.0.3、MDX、Shiki、KaTeX、Pagefind、Lucide Astro、Vitest、Playwright、axe-core、GitHub Pages Actions。

**设计依据：**[网站基础版本设计文档](../design/2026-09-03-website-setup.md)

**状态：**任务 1～14 已全部执行；网站基础版本于 2026-09-04 通过用户最终验收，并完成现状文档、历史记录和收尾验证。

## 实际执行说明

- Astro 从原计划 `7.3.0` 调整为用户批准的 `7.2.10`，原因是 7.3.0 Image 插件引用未公开内部 logger，生产构建失败。
- `lucide-astro` 已按用户批准替换为官方后继包 `@lucide/astro@1.40.0`。GitHub 品牌标志来自 GitHub Octicons 本地组件。
- pnpm 11.25 的构建许可改用 `pnpm-workspace.yaml`，允许 `esbuild` 和 `sharp`。
- 为允许中英文使用相同公共 slug，Astro 内部 collection 按栏目和语言拆分；公开目录结构、frontmatter 和 URL 规则不变。
- fixture 使用独立 Astro cache 和输出目录，防止测试内容污染真实生产构建。
- Chromium 与 WebKit 完整套件通过；Playwright Firefox 在当前 Windows 主机上启动时报 `spawn UNKNOWN`，已在沙箱内外复核，作为环境限制保留。
- 用户批准主页加入助手编写的临时排版文字；最终验收交付必须列出这些文件和内容类别。

## 全局约束

- 本路线图不是实现授权。只有用户明确说“批准实现”“开始开发”或同等清晰表述后才能执行任务 1。
- 开始实现前重新阅读 `AGENTS.md`、开发策略、测试策略、设计文档和本路线图。
- `docs/requirements/` 是用户只读区。
- 保留所有无关工作区改动。根目录 `avatar.jpg` 只允许在任务 5 的已批准步骤中移动。
- 未经独立 Git 授权，不得 add、commit、branch、merge、push、pull、tag 或改写历史。
- 每个检查点只检查 Git 状态并提醒用户更新，不自动执行 Git 操作。
- 固定使用 `site: https://peterzhang9595.github.io` 和 `base: /MyWebsite`。
- 中文默认位于 `/`，英文位于 `/en/`。
- 公开 slug 使用小写英文 ASCII，显示路径可以使用中文。
- 不发布编造的 Bio、Recent Focus、Tips、Notes、Projects、Interests、句子、音乐或演示媒体。
- 用户已批准主页使用少量助手编写的临时排版验证文字。它们必须集中存放、不得伪装成用户正式陈述，并在验收交付时逐项列出。
- 无可选 JavaScript 时保留 Default Bio、浅色主题、静态导航和静态媒体退化。
- 测试代码和 fixtures 统一放在根 `tests/`。
- 临时截图、trace 和报告放在 `tests/artifacts/2026-09-03-website-setup/` 或其它已忽略输出目录。
- 所有直接依赖精确锁定。新增依赖、公开字段、路由形状、媒体接口、部署模型或显著视觉偏差必须重新申请授权。
- 所有新建或实质重写的项目文档使用简体中文；命令、路径、标识符、包名和专有名词保留原文。

## 已批准的精确依赖版本

以下版本于 2026-09-03 核对。安装前再次确认这些精确版本仍可下载，不得自动替换为新版本。

| 包 | 版本 | 类型 |
| --- | ---: | --- |
| `astro` | `7.2.10` | dependency |
| `@astrojs/mdx` | `8.0.0` | dependency |
| `@astrojs/markdown-remark` | `7.3.0` | dependency |
| `@astrojs/sitemap` | `3.7.4` | dependency |
| `katex` | `0.18.5` | dependency |
| `@lucide/astro` | `1.40.0` | dependency |
| `rehype-katex` | `7.0.1` | dependency |
| `remark-math` | `6.0.0` | dependency |
| `sharp` | `0.35.4` | dependency |
| `@astrojs/check` | `0.9.10` | devDependency |
| `@axe-core/playwright` | `4.13.0` | devDependency |
| `@playwright/test` | `1.62.1` | devDependency |
| `@types/node` | `24.13.3` | devDependency |
| `pagefind` | `1.5.2` | devDependency |
| `typescript` | `6.0.3` | devDependency |
| `vitest` | `4.1.11` | devDependency |

## 计划文件结构

### 配置

- `package.json`：精确依赖、Node/pnpm 声明和稳定命令接口。
- `pnpm-lock.yaml`：依赖锁文件。
- `astro.config.mjs`：site/base、MDX、Sitemap、Shiki、数学和本地 Markdown 插件。
- `tsconfig.json`：严格 TypeScript 配置。
- `vitest.config.ts`：Node 环境单元与集成测试。
- `playwright.config.ts`：基于 fixture 构建的浏览器测试。
- `.gitignore`：构建、测试、浏览器报告和 `.superpowers/`。

### 核心逻辑

- `src/site.config.ts`：姓名、所在地、GitHub、site 和 base。
- `src/content.config.ts`：Astro 7 内容 loader 和 schema。
- `src/lib/types.ts`：语言、栏目、路径与视图模型类型。
- `src/lib/content-schema.ts`：内容 schema 工厂。
- `src/lib/local-data.ts`：Recent Focus、quotes、music 的 Zod 验证。
- `src/lib/content-repository.ts`：加载、验证、过滤和缓存集合。
- `src/lib/content-tree.ts`：Notes 直接子级和排序。
- `src/lib/translations.ts`：译文匹配与切换回退。
- `src/lib/git-dates.ts`：Git 日期读取和覆盖规则。
- `src/lib/urls.ts`：base-safe URL 与 canonical。
- `src/lib/seo.ts`：SEO 和结构化数据模型。
- `src/lib/bio-state.ts`、`search-state.ts`、`quote-state.ts`、`media-state.ts`：可单测的交互规则。
- `src/i18n/config.ts`、`ui.ts`、`routes.ts`：语言、词典与路由。

### 布局、组件和样式

- `src/layouts/BaseLayout.astro`：文档壳、主题预加载、SEO、工具栏和 Pagefind 边界。
- `src/layouts/HomeLayout.astro`：响应式双栏主页。
- `src/layouts/ContentLayout.astro`：目录和文章布局。
- `src/components/navigation/TerminalPath.astro`、`LanguageSwitch.astro`。
- `src/components/ui/UtilityToolbar.astro`、`ThemeToggle.astro`。
- `src/components/home/ProfileHeader.astro`、`BioToggle.astro`、`RecentFocus.astro`、`TipsIndex.astro`、`SectionEntry.astro`。
- `src/components/content/DirectoryIndex.astro`、`ArticleMeta.astro`、`CodeCopy.astro`、`mdx-components.ts`。
- `src/components/search/SearchTrigger.astro`、`SearchDialog.astro`。
- `src/components/media/QuoteRotator.astro`、`IllustrationMedia.astro`、`MusicPlayerShell.astro`。
- `src/styles/tokens.css`、`global.css`、`prose.css`。

### 内容、路由与资源

- `src/content/{bio,notes,tips,projects,interests}/{zh,en}/`：用户内容目录。
- `src/data/recent-focus.json`、`quotes.json`、`music.json`：初始为空数组。
- `src/assets/profile/avatar.jpg`：实现授权后由根目录移动。
- `assets/licenses.md`：字体、图标、头像和未来媒体来源记录。
- `public/media/{illustration,audio}/.gitkeep`。
- `public/robots.txt`、`public/social/default.png`。
- `src/pages/`：设计文档列出的全部中英文路由和 `404.astro`。

### 脚本、测试和部署

- `src/plugins/remark-callouts.ts`：GitHub 风格提示块转换。
- `scripts/playwright-site.mjs`：跨平台 fixture 构建、Pagefind 和预览服务。
- `scripts/generate-social-card.mjs`：生成固定分享图。
- `tests/fixtures/content/**`：非公开双语内容。
- `tests/unit/**`、`tests/integration/**`、`tests/e2e/**`。
- `.github/workflows/ci.yml`、`deploy.yml`。
- `docs/deployment/2026-09-03-github-pages.md`。
- `docs/documents/**` 和 `docs/records/2026-09-03-website-setup.md` 仅在验收后创建或更新。

---

### 任务 1：初始化可复现 Astro 工程

**文件：**创建 `package.json`、`pnpm-lock.yaml`、`astro.config.mjs`、`tsconfig.json`、`vitest.config.ts`、`playwright.config.ts`、`.gitignore`、最小 `src/pages/index.astro`；修改根 `README.md` 和 `docs/env-list/environment.md`。

**产出接口：**`pnpm run check`、`pnpm run build`、`pnpm run test:unit`、`pnpm run test:e2e`。

- [x] **步骤 1：复核授权与工作区范围**

  ```powershell
  git status --short --branch
  Get-Content -Raw AGENTS.md
  Get-Content -Raw docs/development/strategy.md
  Get-Content -Raw docs/testing-strategies/2026-09-03-testing-strategy.md
  Get-Content -Raw docs/design/2026-09-03-website-setup.md
  Get-Content -Raw docs/implement-roadmap/2026-09-03-website-setup.md
  ```

  预期：聊天中存在明确实现授权，且所有无关用户改动已识别。

- [x] **步骤 2：创建精确 package manifest**

  ```json
  {
    "name": "peter-zhang-website",
    "version": "0.1.0",
    "private": true,
    "type": "module",
    "engines": { "node": ">=24.20.0 <25" },
    "packageManager": "pnpm@11.25.0",
    "scripts": {
      "dev": "astro dev",
      "check": "astro check",
      "build:astro": "astro build",
      "index:search": "pagefind --site dist",
      "build": "pnpm run build:astro && pnpm run index:search",
      "preview": "astro preview",
      "preview:search": "pnpm run build && astro preview",
      "test:unit": "vitest run",
      "test:unit:watch": "vitest",
      "test:e2e": "playwright test",
      "test:all": "pnpm run check && pnpm run test:unit && pnpm run build && pnpm run test:e2e"
    },
    "dependencies": {
      "@astrojs/markdown-remark": "7.3.0",
      "@astrojs/mdx": "8.0.0",
      "@astrojs/sitemap": "3.7.4",
      "astro": "7.2.10",
      "katex": "0.18.5",
      "@lucide/astro": "1.40.0",
      "rehype-katex": "7.0.1",
      "remark-math": "6.0.0",
      "sharp": "0.35.4"
    },
    "devDependencies": {
      "@astrojs/check": "0.9.10",
      "@axe-core/playwright": "4.13.0",
      "@playwright/test": "1.62.1",
      "@types/node": "24.13.3",
      "pagefind": "1.5.2",
      "typescript": "6.0.3",
      "vitest": "4.1.11"
    }
  }
  ```

  pnpm 11.25 的构建脚本许可写在仓库根 `pnpm-workspace.yaml`：

  ```yaml
  allowBuilds:
    esbuild: true
    sharp: true
  minimumReleaseAgeExclude:
    - astro@7.2.10
  ```

- [x] **步骤 3：安装批准依赖**

  ```powershell
  corepack pnpm install
  ```

  预期：生成锁文件，Sharp 安装成功，manifest 没有未批准直接依赖。

- [x] **步骤 4：创建最小配置**

  `astro.config.mjs` 初始内容：

  ```js
  import { defineConfig } from 'astro/config';
  import mdx from '@astrojs/mdx';
  import sitemap from '@astrojs/sitemap';

  export default defineConfig({
    site: 'https://peterzhang9595.github.io',
    base: '/MyWebsite',
    output: 'static',
    outDir: process.env.TEST_CONTENT_FIXTURES === '1'
      ? './tests/artifacts/2026-09-03-website-setup/site'
      : './dist',
    integrations: [mdx({ extendMarkdownConfig: true }), sitemap()],
  });
  ```

  `tsconfig.json` 继承 `astro/tsconfigs/strict`。Vitest 使用 Node 环境。Playwright 建立 `chromium`、`firefox`、`webkit` 项目，`baseURL` 为 `http://127.0.0.1:4321/MyWebsite/`，`webServer.command` 为 `node scripts/playwright-site.mjs`。

- [x] **步骤 5：创建最小首页与忽略规则**

  首页只包含合法 HTML、`lang="zh-CN"` 和已批准身份文本 `Peter Zhang`，不编造 Bio。

  ```gitignore
  node_modules/
  dist/
  .astro/
  .superpowers/
  playwright-report/
  test-results/
  tests/artifacts/**
  !tests/artifacts/.gitignore
  ```

- [x] **步骤 6：更新项目入口文档**

  根 `README.md` 写明项目用途、Node/pnpm 版本，以及安装、开发、完整测试和生产构建命令；链接 `docs/README.md`，不复制治理规则。

- [x] **步骤 7：验证初始化结果**

  ```powershell
  pnpm exec astro --version
  pnpm run check
  pnpm run build
  ```

  预期：Astro 为 `7.2.10`，检查和构建通过，`dist/` 包含 Pagefind 输出。

- [x] **步骤 8：更新环境文档并交付检查点**

  在 `docs/env-list/environment.md` 记录精确直接依赖、Playwright 浏览器安装命令和项目脚本。展示 manifest、锁文件摘要、构建证据和 Git 状态，只建议用户提交。

### 任务 2：定义内容 schema、数据验证与 fixture 隔离

**文件：**创建 `src/lib/types.ts`、`content-schema.ts`、`local-data.ts`、`src/content.config.ts`、`src/site.config.ts`、三个 JSON 数据文件、十个内容目录 `.gitkeep`、`scripts/playwright-site.mjs`、`tests/unit/content-schema.test.ts` 和 `tests/fixtures/content/**`。

**产出接口：**`Lang`、`Section`、内容 schema、`loadRecentFocus()`、`loadQuotes()`、`loadMusic()`；`TEST_CONTENT_FIXTURES=1` 只替换测试内容根。

- [x] **步骤 1：先写失败 schema 测试**

  ```ts
  const schema = createCommonContentSchema(() => z.string());
  expect(schema.parse(validNote).draft).toBe(true);
  expect(() => schema.parse({ ...validNote, lang: 'fr' })).toThrow();
  expect(() => schema.parse({ ...validNote, slug: 'CS 285/第三篇' })).toThrow();
  expect(projectSchema.parse({ ...validProject, status: 'active' }).status).toBe('active');
  expect(() => projectSchema.parse({ ...validProject, status: 'paused' })).toThrow();
  ```

- [x] **步骤 2：验证测试确实失败**

  ```powershell
  pnpm exec vitest run tests/unit/content-schema.test.ts
  ```

- [x] **步骤 3：实现类型与 schema**

  ```ts
  export type Lang = 'zh' | 'en';
  export type Section = 'notes' | 'tips' | 'projects' | 'interests';
  export type ProjectStatus = 'active' | 'completed' | 'archived';
  export interface PathSegment { label: string; href?: string }
  ```

  slug 与 translationKey 使用：

  ```ts
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/
  ```

  `createCommonContentSchema(image)` 接收 Astro image validator。`draft` 默认 `true`；日期使用 `z.coerce.date()`；Project 状态只允许三个已批准值。slug 包含栏目前缀，例如 `notes`、`notes/cs285`、`notes/cs285/policy-gradient`，不包含语言前缀。

  Astro 7 导入固定为：

  ```ts
  import { defineCollection } from 'astro:content';
  import { glob } from 'astro/loaders';
  import { z } from 'astro/zod';
  ```

- [x] **步骤 4：配置真实与测试 loader**

  ```ts
  const contentRoot = process.env.TEST_CONTENT_FIXTURES === '1'
    ? './tests/fixtures/content'
    : './src/content';
  ```

  为 bio、notes、tips、projects、interests 建立 glob collection。

- [x] **步骤 5：建立非公开双语 fixtures**

  创建配对 Bio、嵌套 Notes 目录、配对 Note、未翻译中文 Note、草稿、配对 Tips、配对 Projects 和双语 Interests。测试标题使用 `Fixture Note` 等明确测试词。所有已发布 fixture 写入固定 `publishedAtOverride` 和 `updatedAtOverride`，保证提交前也能构建。

- [x] **步骤 6：实现测试预览进程**

  `scripts/playwright-site.mjs` 在 Windows 使用 `pnpm.cmd`，其它系统使用 `pnpm`；对子进程传入 `TEST_CONTENT_FIXTURES=1`；依次运行 `pnpm run build:astro`、针对测试输出目录运行 Pagefind、再运行：

  ```text
  pnpm exec astro preview --host 127.0.0.1 --port 4321
  ```

  有限命令使用 `spawnSync()`，预览使用 `spawn()`；转发 `SIGINT` 和 `SIGTERM`；任何构建或索引失败立即退出非零。

- [x] **步骤 7：创建站点配置和空数据**

  ```ts
  export const siteConfig = {
    name: 'Peter Zhang',
    location: 'China / Beijing',
    githubUrl: 'https://github.com/PeterZhang9595',
    siteUrl: 'https://peterzhang9595.github.io',
    basePath: '/MyWebsite',
    copyrightOwner: 'Peter Zhang',
    description: {
      zh: 'Peter Zhang 的个人网站。',
      en: "Peter Zhang's personal website.",
    },
  } as const;
  ```

  三个 JSON 初始化为 `[]`。`local-data.ts` 用 Zod 验证标识符、语言、URL、order 和版权字段。

- [x] **步骤 8：运行检查**

  ```powershell
  pnpm exec vitest run tests/unit/content-schema.test.ts
  pnpm run check
  pnpm run build
  ```

- [x] **步骤 9：交付内容模型检查点**

  展示字段、空数据和 fixture 隔离规则；只提醒用户提交。

### 任务 3：实现 base-safe 双语和 URL helper

**文件：**创建 `src/i18n/config.ts`、`ui.ts`、`routes.ts`、`src/lib/urls.ts`、`translations.ts` 以及三个对应单元测试。

**产出接口：**`ui(lang,key)`、`sectionPath(lang,section)`、`withBase(path)`、`canonicalUrl(path)`、`languageSwitchTarget(input)`。

- [x] **步骤 1：先写失败测试**

  ```ts
  expect(sectionPath('zh', 'notes')).toBe('/notes/');
  expect(sectionPath('en', 'notes')).toBe('/en/notes/');
  expect(withBase('/en/notes/')).toBe('/MyWebsite/en/notes/');
  expect(canonicalUrl('/notes/')).toBe('https://peterzhang9595.github.io/MyWebsite/notes/');
  expect(languageSwitchTarget(pairedNote)).toBe('/en/notes/policy-gradient/');
  expect(languageSwitchTarget(untranslatedNote)).toBe('/en/notes/');
  ```

- [x] **步骤 2：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/i18n.test.ts tests/unit/urls.test.ts tests/unit/translations.test.ts
  ```

- [x] **步骤 3：实现完整类型词典**

  词典覆盖导航、`cd ..`、Bio、搜索、主题、空状态、播放器、日期、404 和栏目名，并满足：

  ```ts
  type UiDictionary = Record<Lang, Record<UiKey, string>>;
  ```

  缺少词条必须产生 TypeScript 错误，不跨语言静默回退。

- [x] **步骤 4：实现 URL 与译文回退**

  URL helper 统一前后斜杠，避免重复 `/MyWebsite`，并可从显示路径中移除 base。`languageSwitchTarget()` 只有在存在 translatedSlug 时进入详情，否则返回目标语言栏目首页。

- [x] **步骤 5：运行验证并交付检查点**

  ```powershell
  pnpm exec vitest run tests/unit/i18n.test.ts tests/unit/urls.test.ts tests/unit/translations.test.ts
  pnpm run check
  ```

  展示配对和未配对切换结果，只提醒用户提交。

### 任务 4：实现内容仓库、Notes 树和 Git 日期

**文件：**创建 `src/lib/content-repository.ts`、`content-tree.ts`、`git-dates.ts`，以及对应 unit/integration 测试。

**产出接口：**`loadPublicContent()`、`listDirectChildren()`、`findTranslation()`、`getGitDates()`、`resolveContentDates()`。

- [x] **步骤 1：先写排序和直接子级失败测试**

  ```ts
  expect(sortEntries([titleB, ordered2, ordered1])).toEqual([ordered1, ordered2, titleB]);
  expect(listDirectChildren(notes, 'notes/cs285').articles.map(x => x.slug))
    .toEqual(['notes/cs285/policy-gradient']);
  expect(listDirectChildren(notes, 'notes').directories.map(x => x.slug))
    .toEqual(['notes/cs285']);
  ```

- [x] **步骤 2：先写 Git 日期失败测试**

  ```ts
  expect(resolveContentDates({ draft: true, git: null })).toEqual(null);
  expect(() => resolveContentDates({ draft: false, git: null })).toThrow();
  expect(resolveContentDates({ draft: false, git: null, publishedAtOverride }))
    .toEqual({ publishedAt: publishedAtOverride, updatedAt: publishedAtOverride });
  ```

  集成测试在自身 `mkdtemp()` 目录创建临时 Git 仓库，以受控日期提交同一文件两次，并只删除该临时目录。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/content-tree.test.ts tests/unit/git-dates.test.ts tests/integration/git-dates.test.ts
  ```

- [x] **步骤 4：实现排序与 Notes 树**

  顺序固定为：有 order 的条目优先、order 升序、当前语言标题排序、slug 最终稳定排序。只返回 direct directories 和 direct articles。

- [x] **步骤 5：实现集合验证与缓存**

  `loadPublicContent()` 必须验证 entry ID/file path 的首段与 `lang` 一致；slug 以对应栏目开头且不含语言；拒绝重复 `(lang,slug)` 和重复 `(translationKey,lang)`；生产排除草稿；为已发布内容附加日期；一次构建缓存结果。

- [x] **步骤 6：实现 Git 日期**

  ```ts
  execFileSync('git', ['log', '--follow', '--format=%aI', '--', relativePath], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  ```

  Git log 第一行是最近更新时间，最后一行是首次发布时间。覆盖字段优先；只有 published override 且无 Git 时，两日期相同，界面不重复显示更新时间。完全没有日期来源的已发布内容抛出包含路径的错误。

- [x] **步骤 7：把验证接入所有路由数据入口**

  中文/英文主页和四个栏目只通过 `loadPublicContent()` 读取。首次调用验证所有集合，因此 `astro build` 在无效内容上失败，不另写重复验证脚本。

- [x] **步骤 8：运行完整相关检查**

  ```powershell
  pnpm exec vitest run tests/unit/content-tree.test.ts tests/unit/git-dates.test.ts tests/integration/git-dates.test.ts tests/integration/content-repository.test.ts
  pnpm run check
  pnpm run build
  ```

- [x] **步骤 9：交付日期与 Notes 检查点**

  展示日期来源和直接子级证据；提醒未来发布内容必须提交或写覆盖日期。

### 任务 5：实现设计变量、基础布局、终端路径、主题和头像

**文件：**创建 `tokens.css`、`global.css`、`BaseLayout.astro`、终端路径、语言切换、工具栏、主题和搜索触发组件、`assets/licenses.md`；移动头像；创建 theme unit 和 base-layout E2E。

**产出接口：**BaseLayout 元数据 props；TerminalPath `{lang,segments,parentHref}`；`theme` localStorage 值 `light|dark`。

- [x] **步骤 1：先写主题失败测试**

  ```ts
  resolveInitialTheme(saved: string | null): 'light' | 'dark'
  ```

  `null`、无效值和 `system` 都返回 light，只有 `dark` 返回 dark。

- [x] **步骤 2：先写基础布局 E2E**

  检查中英文 `html lang`、首页提示符、主题切换与刷新、清除存储后恢复浅色，以及三个工具栏按钮可见焦点。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/theme-state.test.ts
  pnpm exec playwright test tests/e2e/base-layout.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现配色、字体和基础布局**

  使用设计文档精确浅色和深色 token。定义 reading、ui、mono 字体变量，不打包 Iowan Old Style。深色焦点紫经对比度测量达到 AA。BaseLayout 包含 skip link、main、工具栏和 Pagefind ignore 边界。

- [x] **步骤 5：实现页面绘制前主题脚本**

  ```js
  try {
    const saved = localStorage.getItem('theme');
    document.documentElement.dataset.theme = saved === 'dark' ? 'dark' : 'light';
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
  ```

- [x] **步骤 6：实现终端路径和工具栏**

  路径逐级链接，当前段不可点击；所有页面第一行面包屑/提示符统一使用 `#fff9df` 浅色背景，`cd ..` 单独作为第二行无背景父链接。工具栏顺序固定为 `中 / EN`、主题、搜索；使用 `@lucide/astro` 和无障碍名称。

- [x] **步骤 7：安全移动头像**

  精确源和目标：

  ```text
  C:\WorkSpace\website\avatar.jpg
  C:\WorkSpace\website\src\assets\profile\avatar.jpg
  ```

  先确认目标位于仓库内且源是用户提供文件，再移动。通过 Astro Image 管线加载，不放入 `public/`。

- [x] **步骤 8：记录素材许可**

  `assets/licenses.md` 记录 Lucide ISC、Iowan 仅本地调用且不分发、头像为用户提供，并建立列为“素材名、来源、作者、许可证、来源 URL、仓库位置”的空媒体登记表。

- [x] **步骤 9：运行检查并交付视觉检查点**

  ```powershell
  pnpm exec vitest run tests/unit/theme-state.test.ts
  pnpm run check
  pnpm run build
  pnpm exec playwright test tests/e2e/base-layout.spec.ts --project=chromium
  ```

  展示路径、工具栏、浅/深色和头像截图，只提醒用户提交。

### 任务 6：实现主页内容与 Bio

**文件：**创建 `HomeLayout.astro`、ProfileHeader、BioToggle、RecentFocus、TipsIndex、SectionEntry、`bio-state.ts`，替换中英文首页，创建 unit/E2E。

- [x] **步骤 1：先写 Bio 失败测试**

  ```ts
  expect(selectBioVariant('default', 'long', true)).toBe('long');
  expect(selectBioVariant('default', 'long', false)).toBe('default');
  expect(initialBioVariant()).toBe('default');
  ```

- [x] **步骤 2：先写主页 E2E**

  检查居中圆形头像、姓名、所在地、GitHub；Default/Long 完整替换和刷新恢复；Recent Focus 手动顺序；Tips 只显示标题；三个栏目为整行链接；英文内容；空真实数据不出现虚构条目。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/bio-state.test.ts
  pnpm exec playwright test tests/e2e/homepage.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现双栏和个人资料**

  宽屏左栏 62%～68%、右栏 32%～38%，使用留白；右栏 sticky；空间不足时单栏。个人资料顺序严格为头像、姓名、所在地/GitHub。

- [x] **步骤 5：实现 Bio 与列表**

  Bio 按钮使用 `aria-pressed` 和 `aria-controls`，完整替换内容，短淡入淡出，reduced motion 关闭动效，不写 localStorage。Recent Focus schema：

  ```ts
  interface RecentFocusItem {
    id: string;
    title: Record<Lang, string>;
    description?: Partial<Record<Lang, string>>;
    url?: string;
    order: number;
  }
  ```

  Tips 显示当前语言全部已发布标题。

- [x] **步骤 6：实现栏目入口与版权**

  整行入口包含标题、说明、右侧数量/动作，窄屏堆叠，使用细横线。版权名称来自 site config，年份由构建日期生成。

- [x] **步骤 7：运行检查和截图**

  ```powershell
  pnpm exec vitest run tests/unit/bio-state.test.ts
  pnpm run check
  pnpm run build
  pnpm exec playwright test tests/e2e/homepage.spec.ts --project=chromium
  ```

  保存桌面和移动端主页截图，并与批准预览对比。

- [x] **步骤 8：交付主页检查点**

  用户检查资料层级、栏宽和栏目入口；测试通过不等于验收。

### 任务 7：实现 Notes、Tips、Projects、Interests 和 404

**文件：**创建 `ContentLayout.astro`、DirectoryIndex、ArticleMeta、中英文 Notes/Tips/Projects/Interests 全部路由、`404.astro` 和 route/language-switch E2E。

- [x] **步骤 1：先写路由失败测试**

  直接访问：

  ```text
  /MyWebsite/notes/
  /MyWebsite/notes/cs285/
  /MyWebsite/notes/cs285/policy-gradient/
  /MyWebsite/en/notes/
  /MyWebsite/en/notes/cs285/policy-gradient/
  /MyWebsite/tips/fixture-tip/
  /MyWebsite/projects/fixture-project/
  /MyWebsite/interests/
  ```

  检查 200、标题、提示符和父级链接。

- [x] **步骤 2：先写译文回退失败测试**

  配对 Note 进入精确译文；未翻译 Note 进入 `/MyWebsite/en/notes/`；栏目回退不能出现在 `hreflang`。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec playwright test tests/e2e/routes.spec.ts tests/e2e/language-switch.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现 Notes**

  根目录和嵌套目录先渲染 `_index.md`，再列 direct child directories 和 articles。路径来自已验证 slug，不从文件名直接生成。

- [x] **步骤 5：实现其它栏目**

  Tips 和 Projects 各有 index/detail。Project 展示 status、technologies 和存在时的 repository/demo 链接。Interests 每语言一个长页面。

- [x] **步骤 6：实现静态双语 404**

  静态 HTML 同时提供中英文首页入口。可选脚本仅在 `/en/` 路径优先显示英文，无 JavaScript 时仍能理解。

- [x] **步骤 7：运行检查并交付路由清单**

  ```powershell
  pnpm run check
  pnpm run build
  pnpm exec playwright test tests/e2e/routes.spec.ts tests/e2e/language-switch.spec.ts --project=chromium
  ```

  正常生产 `dist/` 不得包含 draft 或 fixture 路由。

### 任务 8：实现 Markdown、MDX、提示块、代码和数学

**文件：**创建 `remark-callouts.ts`、CodeCopy、`mdx-components.ts`、`prose.css`，修改 Astro 配置，创建 unit/E2E。

- [x] **步骤 1：先写提示块失败测试**

  用手工构造 mdast 测试下列等价结构，不额外安装 Markdown parser：

  ```md
  > [!NOTE]
  > Supporting information.
  ```

  转换后移除 marker、保留正文并添加 `data-callout="note"`；`[!UNKNOWN]` 保持普通引用。

- [x] **步骤 2：先写文章渲染 E2E**

  fixture Note 包含 TypeScript fence、行内代码、四种提示块、行内和块级公式。检查 Shiki、语言标签、复制文本、提示块标签、KaTeX、移动端代码内部滚动和深色代码主题。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/remark-callouts.test.ts
  pnpm exec playwright test tests/e2e/article-rendering.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现提示块转换和 Markdown 配置**

  只识别 `NOTE`、`TIP`、`IMPORTANT`、`WARNING`。Astro 配置：

  ```js
  markdown: {
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
    remarkPlugins: [remarkMath, remarkCallouts],
    rehypePlugins: [rehypeKatex],
  }
  ```

- [x] **步骤 5：实现技术文档样式和 MDX 注册表**

  代码与提示块边界明确、颜色克制；公式居中；表格可读；KaTeX CSS 只加载一次。`mdxComponents` 是唯一公开组件注册对象，初始只含本需求实际实现组件；内容文件不得依赖任意内部路径。

- [x] **步骤 6：实现渐进式复制**

  每个 fenced block 增加一个带语言名称的按钮。成功后通过 `aria-live` 宣布 `Copied`。Clipboard API 不可用时保留代码并显示本地化不可用状态。

- [x] **步骤 7：运行检查并交付文章截图**

  ```powershell
  pnpm exec vitest run tests/unit/remark-callouts.test.ts
  pnpm run check
  pnpm run build
  pnpm exec playwright test tests/e2e/article-rendering.spec.ts --project=chromium
  ```

  展示浅/深色包含代码、提示块和公式的文章截图。

### 任务 9：实现 Pagefind 双语搜索

**文件：**创建 SearchDialog、`search-state.ts`，修改 BaseLayout，创建 unit/E2E。

- [x] **步骤 1：先写快捷键失败测试**

  ```ts
  normalizeShortcut(event): 'open-search' | 'close-search' | null
  ```

  Ctrl+K 和 Meta+K 打开，Escape 关闭，无修饰键 k 不处理。

- [x] **步骤 2：先写生产索引 E2E**

  检查点击/快捷键打开、输入框获得焦点、中英文结果互不混合、Bio 和工具栏不进入结果、Escape 恢复焦点，以及索引加载失败状态。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/search-state.test.ts
  pnpm exec playwright test tests/e2e/search.spec.ts --project=chromium
  ```

- [x] **步骤 4：标记索引边界**

  可搜索正文使用 `data-pagefind-body`，语言使用 `data-pagefind-filter="lang:zh"` 或 `lang:en`。导航、Bio、播放器、媒体和装饰使用 `data-pagefind-ignore`。主页摘要与目录页不索引，避免重复；索引详情和 Interests。

- [x] **步骤 5：实现按需加载和对话框**

  首次打开时动态导入 base-safe `/pagefind/pagefind.js`，只初始化一次，以当前语言过滤。使用原生 `<dialog>`，提供加载、空结果、失败状态，关闭后恢复准确触发控件。

- [x] **步骤 6：运行验证并交付搜索检查点**

  ```powershell
  pnpm exec vitest run tests/unit/search-state.test.ts
  pnpm run build
  pnpm exec playwright test tests/e2e/search.spec.ts --project=chromium
  ```

### 任务 10：实现句子、插画视频接口和播放器外壳

**文件：**创建三个媒体组件、`quote-state.ts`、`media-state.ts`、unit/E2E，修改 HomeLayout，创建两个 public media `.gitkeep`。

- [x] **步骤 1：先写状态失败测试**

  ```ts
  expect(selectInitialQuote([], null)).toBe(null);
  expect(selectInitialQuote(quotes, 'known-id')?.id).toBe('known-id');
  expect(selectNextQuote([oneQuote], 'one')).toEqual(oneQuote);
  expect(canLoadVideo({ mobile: true, reducedMotion: false })).toBe(false);
  expect(canLoadVideo({ mobile: false, reducedMotion: true })).toBe(false);
  ```

- [x] **步骤 2：先写媒体 E2E**

  检查标签页内句子保持和点击更换、不请求外部句子、空播放器禁用且不 autoplay、reduced motion 静态封面、移动端不请求视频。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/quote-state.test.ts tests/unit/media-state.test.ts
  pnpm exec playwright test tests/e2e/media-shell.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现句子与视频**

  句子用 `currentQuoteId` session key，已知 ID 优先，多条时避免立即重复并更新元素 `lang`。视频接口：

  ```ts
  interface IllustrationSource {
    poster?: ImageMetadata;
    videoWebm?: string;
    videoMp4?: string;
    alt: string;
  }
  ```

  只有桌面精细指针且无 reduced motion 时加入 source，悬停约 200ms 播放，移出暂停复位，错误始终保留封面。

- [x] **步骤 5：实现播放器与留白画廊**

  future track 字段为 `id`、`title`、`artist`、`src`、可选 `cover`、`copyright`、`sourceUrl`。空数组显示 `Playlist pending`，禁用播放与进度，不创建 Audio。宽屏播放器只叠插画下缘，单栏回归正常流。

- [x] **步骤 6：运行检查并交付媒体证据**

  ```powershell
  pnpm exec vitest run tests/unit/quote-state.test.ts tests/unit/media-state.test.ts
  pnpm run check
  pnpm run build
  pnpm exec playwright test tests/e2e/media-shell.spec.ts --project=chromium
  ```

  展示桌面、移动端和 reduced motion 证据，确认没有未授权媒体。

### 任务 11：完成基础 SEO

**文件：**创建 `src/lib/seo.ts`、`public/robots.txt`、`public/social/default.png`、`scripts/generate-social-card.mjs`、unit/E2E，修改 BaseLayout。

- [x] **步骤 1：先写 SEO 失败测试**

  ```ts
  expect(buildCanonical('/notes/fixture-note/'))
    .toContain('/MyWebsite/notes/fixture-note/');
  expect(buildAlternates(untranslatedEntry)).toEqual([]);
  expect(buildAlternates(pairedEntry)).toEqual(expect.arrayContaining([
    expect.objectContaining({ hreflang: 'zh-CN' }),
    expect.objectContaining({ hreflang: 'en' }),
  ]));
  ```

- [x] **步骤 2：先写浏览器元数据测试**

  检查独立 title/description、canonical、真实译文 hreflang、Open Graph、首页 Person JSON-LD、文章 Article JSON-LD、sitemap、draft 排除和 robots。

- [x] **步骤 3：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/unit/seo.test.ts
  pnpm exec playwright test tests/e2e/seo.spec.ts --project=chromium
  ```

- [x] **步骤 4：实现元数据**

  JSON-LD 安全转义，日期使用 ISO。栏目回退只用于语言按钮，不生成 hreflang。

- [x] **步骤 5：生成 robots 和分享图**

  ```text
  User-agent: *
  Allow: /

  Sitemap: https://peterzhang9595.github.io/MyWebsite/sitemap-index.xml
  ```

  `generate-social-card.mjs` 使用 Sharp 生成 `1200x630` PNG：白色背景、石墨文字、小号 `peter@website:/root$`、主标题 `Peter Zhang`、副标题 `Personal website · Notes · Projects · Interests`。不使用第三方图片或虚构简介。PNG 提交仓库，CI 不重复生成。

- [x] **步骤 6：运行检查并确认无 RSS**

  ```powershell
  pnpm exec vitest run tests/unit/seo.test.ts
  pnpm run build
  pnpm exec playwright test tests/e2e/seo.spec.ts --project=chromium
  ```

### 任务 12：添加 CI 与 GitHub Pages 部署

**文件：**创建 `.github/workflows/ci.yml`、`deploy.yml`、`docs/deployment/2026-09-03-github-pages.md`、`tests/integration/deployment-config.test.ts`。

- [x] **步骤 1：先写 workflow 失败测试**

  以文本解析验证完整 history、`.node-version`、Corepack、frozen install、检查、构建、Pages 权限、`dist/` 上传，以及不存在 secret 值或 `gh-pages` 命令。

- [x] **步骤 2：运行并确认失败**

  ```powershell
  pnpm exec vitest run tests/integration/deployment-config.test.ts
  ```

- [x] **步骤 3：实现 CI**

  `ci.yml` 在 PR 和 main push 运行：

  1. `actions/checkout@v7.0.1`，`fetch-depth: 0`；
  2. `actions/setup-node@v7.0.0`，读取 `.node-version`；
  3. `corepack enable`；
  4. `pnpm install --frozen-lockfile`；
  5. `pnpm run check`；
  6. `pnpm run test:unit`；
  7. `pnpm run build`；
  8. `pnpm exec playwright install --with-deps chromium`；
  9. fixture 构建上的 Chromium E2E。

- [x] **步骤 4：实现 Pages workflow**

  `deploy.yml` 在 main push 和 manual dispatch 运行，权限为 contents read、pages write、id-token write，并设置 cancel-in-progress。构建 job 依次执行完整 checkout、Node/Corepack、frozen install、check、unit、Chromium fixture E2E、真实内容 `pnpm run build`，然后使用：

  ```text
  actions/configure-pages@v6.0.0
  actions/upload-pages-artifact@v5.0.0
  actions/deploy-pages@v5.0.1
  ```

  上传路径为 `dist`。

- [x] **步骤 5：编写中文部署文档**

  写明公开 URL、Pages 选择 GitHub Actions、完整历史原因、本地生产构建、失败日志、base path 排障、暂停部署方式，以及 custom domain/DNS/secrets 不在范围。

- [x] **步骤 6：运行部署级验证**

  ```powershell
  pnpm exec vitest run tests/integration/deployment-config.test.ts
  pnpm run check
  pnpm run build
  ```

  检查资源、Pagefind、sitemap 和 canonical 都包含正确 `/MyWebsite`。不得自行修改 GitHub 设置或推送。

- [x] **步骤 7：交付部署检查点**

  告知用户提交并推送后需要修改的 GitHub Pages 设置；任何 Git 操作单独申请授权。

### 任务 13：执行 Level 5 完整验证并交付验收

**文件：**临时证据放入 `tests/artifacts/2026-09-03-website-setup/`；此时不创建 records，不更新最终 documents。

- [x] **步骤 1：运行静态、单元、集成和生产检查**

  ```powershell
  pnpm run check
  pnpm run test:unit
  pnpm run build
  ```

- [x] **步骤 2：缺少时安装已批准浏览器运行时**

  解释这是本地测试工具后，在相应授权下运行：

  ```powershell
  pnpm exec playwright install chromium firefox webkit
  ```

- [x] **步骤 3：运行浏览器测试**

  ```powershell
  pnpm run test:e2e
  ```

  Chromium 完整覆盖；Firefox/WebKit 运行主页、路由、语言、文章和搜索 smoke。无法运行的浏览器必须报告风险。

- [x] **步骤 4：运行无障碍与人工键盘检查**

  axe 覆盖首页、目录和文章。人工检查 skip link、焦点、Bio、语言、主题、搜索焦点恢复、句子、播放器状态和 `cd ..`。

- [x] **步骤 5：保存视觉证据**

  ```text
  homepage-light-desktop.png
  homepage-dark-desktop.png
  homepage-light-mobile.png
  article-light-desktop.png
  article-dark-mobile.png
  search-chinese.png
  search-english.png
  ```

  双栏折叠存在风险时增加中间宽度截图。

- [x] **步骤 6：检查仓库与内容卫生**

  确认 production dist 无 fixtures/drafts；无未授权字体和媒体；临时输出已忽略；源码和生成结果无 secret；requirements 未被助手修改；Git 状态区分本需求和用户改动。

- [x] **步骤 7：交付用户验收**

  报告实现范围、实际命令和结果、截图、未执行检查、剩余风险和待审文件。测试通过只代表可验收，等待用户明确验收后再执行任务 14。

### 任务 14：验收后编写现状文档和历史记录

**文件：**验收后创建 `docs/documents/website-architecture.md`、`content-authoring.md`、`visual-and-interaction-system.md`、代表性截图目录和 `docs/records/2026-09-03-website-setup.md`；更新 `docs/README.md` 和环境文档。

- [x] **步骤 1：确认明确验收**

  如果用户只说“看起来可以”且语义不明确，继续询问，不提前创建最终记录。

- [x] **步骤 2：编写中文现状架构文档**

  说明路由入口、布局、内容仓库、数据文件、构建顺序、base helper、Git 日期和依赖边界，引用最终真实文件路径和接口。

- [x] **步骤 3：编写中文内容创作指南**

  提供 Bio、Notes `_index.md`、Note、Tip、Project、Interests 的可复制模板；解释字段、draft、slug、译文、日期、提示块、代码、KaTeX、图片和本地数据。

- [x] **步骤 4：编写中文视觉与交互文档**

  记录 token、字体、断点、路径、资料区、工具栏、Bio、搜索、句子、视频和播放器扩展接口。只复制验收后的代表性截图。

- [x] **步骤 5：创建中文历史记录**

  链接需求、设计、路线图、测试、部署和现状文档，记录实际依赖、命令、测试、偏差、例外和验收日期。

- [x] **步骤 6：验证文档并提醒 Git 更新**

  检查中文文档规则、链接、命名、未完成标记、矛盾和 Git diff；列出本需求应提交文件及建议提交信息，不自动执行 Git 操作。

## 执行门槛

本路线图目前只供用户审阅。用户批准路线图后，仍需另行给出明确实现授权才能开始任务 1。获得授权后默认使用 `superpowers:executing-plans` 在当前任务内分批执行；只有用户明确要求时才使用子代理。

