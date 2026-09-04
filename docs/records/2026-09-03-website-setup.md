# 网站基础版本实现记录

## 状态

- 需求状态：已验收
- 验收日期：2026-09-04
- 变更类型：网站初始化、内容系统、双语页面、视觉交互、测试与部署配置
- 开发分支：`codex/website-setup`

## 相关文档

- [原始需求](../requirements/2026-09-03-website-setup.md)
- [批准设计](../design/2026-09-03-website-setup.md)
- [实现路线图](../implement-roadmap/2026-09-03-website-setup.md)
- [测试策略](../testing-strategies/2026-09-03-testing-strategy.md)
- [当前环境](../env-list/environment.md)
- [GitHub Pages 部署说明](../deployment/2026-09-03-github-pages.md)
- [网站架构与维护接口](../documents/website-architecture.md)
- [内容创作与维护指南](../documents/content-authoring.md)
- [视觉与交互系统](../documents/visual-and-interaction-system.md)

原始需求文件保持用户所有，助手没有修改其内容。

## 1. 已验收结果

本次从空的 `src/` 基础建立了可静态构建的 Astro 个人网站，包含：

- 中文默认、英文 `/en/` 的双语路由；
- 主页个人资料、Default/Long Bio、Recent Focus、Tips 和三大栏目入口；
- 桌面双栏与移动单栏布局；
- Notes 多层目录、Tips 详情、Projects 详情和 Interests 长页；
- `translationKey` 真实译文对应与无译文栏目回退；
- 全站终端路径、祖先链接和 `cd ..`；
- 浅色/深色主题与本地持久化；
- Pagefind 当前语言搜索；
- Recent Focus 站内链接自动适配 GitHub Pages `/MyWebsite` base；
- Shiki 代码高亮、代码复制、GitHub 风格提示块和 KaTeX；
- Git 历史日期与手动覆盖字段；
- title、description、canonical、真实译文 `hreflang`、Open Graph、JSON-LD、sitemap、robots 和 404；
- 本地随机句子、插画/视频接口和音乐播放器外壳；
- GitHub Actions CI 与 GitHub Pages 部署 workflow；
- 单元、集成、E2E、无障碍、响应式和视觉检查基础设施。

## 2. 主要实现选择

### Astro 与静态边界

网站使用 Astro 静态输出，不引入 React、Vue、Tailwind、客户端路由、数据库或服务端 API。交互由小型原生脚本独立增强，核心内容在 JavaScript 不可用时仍可阅读。

### 双语内容

中英文内容分别注册为内部 collection，避免相同公共 slug 的 ID 冲突。内容使用 `lang` 和可选 `translationKey`；没有真实译文时语言按钮回到目标语言栏目首页，且不生成误导性的 `hreflang`。

### 内容日期

已发布内容默认使用完整 Git 历史的最早和最近提交时间。迁移或特殊内容可以提供覆盖日期；已发布且没有任何日期来源时构建失败。CI 和部署因此拉取完整历史。

### GitHub Pages

正式站点配置为：

```text
site: https://peterzhang9595.github.io
base: /MyWebsite
公开地址: https://peterzhang9595.github.io/MyWebsite/
```

内部路径、canonical、sitemap、分享图和 Pagefind 均按这一 base 验证。工作流已实现，但截至验收时尚未提交、合并、推送，也未修改 GitHub Pages 外部设置，因此线上部署尚未发生。

## 3. 视觉与聊天补充决定

实现期间根据用户预览意见完成了以下调整：

- 缩小头像下 `Peter Zhang` 的字号；
- GitHub 链接使用 GitHub Mark，而不是通用链接字符；
- 主页右侧句子、视频和音乐区域整体下移，与右上工具栏保持距离；
- 中文“更换句子”改为“换一个”，并放在句子右下方；
- 所有 `TerminalPath` 第一行在浅色主题使用 `#fff9df`，深色主题使用 `#302c22`；
- `cd ..` 不使用路径背景色；
- 网站最终保持桌面双栏、移动端单栏；
- 字体使用 Iowan/Palatino/Georgia/中文宋体系统后备栈，不分发 Iowan 字体文件。

这些决定已经同步到设计文档和现状文档。

## 4. 依赖与工具链

项目精确锁定的主要版本：

| 类别 | 版本 |
| --- | --- |
| Node.js | `24.20.0` |
| pnpm | `11.25.0` |
| Astro | `7.2.10` |
| MDX | `8.0.0` |
| Sitemap | `3.7.4` |
| Pagefind | `1.5.2` |
| Vitest | `4.1.11` |
| Playwright | `1.62.1` |
| TypeScript | `6.0.3` |
| KaTeX | `0.18.5` |
| Lucide Astro | `1.40.0` |
| Sharp | `0.35.4` |

pnpm 11.25 的构建许可保存在 `pnpm-workspace.yaml`，只允许 `esbuild` 和 `sharp` 执行必要安装脚本。

## 5. 与原计划的偏差和例外

### Astro 版本回退

最初计划使用 Astro `7.3.0`。实际构建发现该版本的 Image 插件引用未公开的 `astro/_internal/logger`，生产构建失败。用户明确批准改用无该回归的 `7.2.10`，并继续精确锁定。

### 图标版本

最终使用 `@lucide/astro@1.40.0` 提供通用线性图标；GitHub 品牌图标由本地 GitHub Mark 组件单独渲染。

### 浏览器验证范围

Chromium 与 WebKit 可在当前 Windows 主机运行。Firefox 运行时已安装，但启动返回 `spawn UNKNOWN`，页面测试没有实际进入 Firefox。该问题记录为当前主机限制；CI 的 Ubuntu 流程仍运行 Chromium。

### fixture 隔离

Playwright 使用 `TEST_CONTENT_FIXTURES=1` 将测试 collection、Astro cache 和输出目录切换到 `tests/` 下，防止测试文章进入正式 `dist/`。验收后文档截图另外从正式内容预览生成，没有把 fixture 页面作为产品现状。

## 6. 验证证据

交付验收前完整运行 `pnpm run test:all`，结果为：

- Astro check：0 errors、0 warnings、0 hints；
- Vitest：14 个测试文件、34 项测试通过；
- Chromium：21/21 通过；
- WebKit：21/21 通过；
- 正式生产构建：13 个页面成功；
- Pagefind：中文和英文索引成功；
- `git diff --check`：通过。

另完成桌面、移动端、浅色、深色、文章、搜索、键盘和无障碍检查。临时测试证据位于被 Git 忽略的 `tests/artifacts/2026-09-03-website-setup/`；验收后选择的正式内容截图位于 `docs/documents/assets/2026-09-03-website-setup/`。

本记录完成后仍需重新运行完整验证，最终结果以本次任务结束时的报告为准。

2026-09-04 收尾时已重新执行等价于 `pnpm run test:all` 的完整工具链。由于当前工作目录的 `node_modules` 由另一 pnpm 运行环境建立，直接调用 `pnpm run` 会先请求重建依赖目录；为避免不必要的依赖重装，本次使用已锁定的 Scoop Node.js `24.20.0` 直接调用项目现有 Astro、Vitest、Pagefind 和 Playwright 入口。最终结果为 Astro 0 问题、Vitest 34/34、正式构建 13 页、Chromium 21/21、WebKit 21/21，退出码为 0。

第一次浏览器重跑曾被 08:13 启动的本地正式预览占用 `4321`，导致测试错误复用了正式内容。确认端口所属进程后停止该可恢复预览，fixture 测试随后全部通过；这不是页面实现回归。

最终差异审阅发现 Recent Focus 的站内 URL 曾直接输出，部署到项目站点时会绕过 `/MyWebsite`。新增 URL helper 回归测试先确认失败，再实现 `localDataHref` 并应用到中英文主页；完整测试重跑后通过。

## 7. 临时排版文字披露

用户明确允许助手添加少量文字验证中英文、段落和列表排版。以下位置仍包含助手编写、尚待用户替换的内容：

- `src/content/bio/{zh,en}/{default,long}.md`；
- `src/content/tips/{zh,en}/understand-before-tools.md`；
- `src/data/recent-focus.json`；
- `src/data/quotes.json`；
- 中英文主页的栏目说明；
- `src/site.config.ts` 默认站点简介；
- 插画、视频和音乐空状态文案。

这些文字只表示开发阶段的版式验证，不代表用户的真实经历、正式价值观或最终个人陈述。`tests/fixtures/content/` 全部是测试数据，不进入正式生产构建。

## 8. 延后范围

本次没有实现：AI 翻译、RSS、自定义域名、评论、分析、账户、服务端 API、动态分享图、跨页音频、正式插画/视频/音乐、自动视觉回归基线、Interests 子页和完整播放器。

## 9. Git 与部署状态

验收时实现仍位于 worktree：

```text
C:\WorkSpace\website\.worktrees\website-setup
```

分支为 `codex/website-setup`，基于 `main` 的 `254652b`。助手没有执行 `git add`、commit、merge 或 push。下一步需要由用户选择本地合并、推送创建 Pull Request，或暂时保留分支；只有提交并推送到 `main` 且 GitHub Pages Source 选择 GitHub Actions 后，线上站点才会部署。
