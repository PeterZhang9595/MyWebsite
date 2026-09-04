# GitHub Pages 部署说明

## 当前状态

- 状态：已启用并成功部署
- 首次成功部署日期：2026-09-04
- 部署提交：`370578480d431cfcba06e8ff2520fb0ee194bfe9`
- CI：[成功运行](https://github.com/PeterZhang9595/MyWebsite/actions/runs/33824187900)
- Pages：[成功运行（第 2 次尝试）](https://github.com/PeterZhang9595/MyWebsite/actions/runs/33824187975)

## 公开地址

`https://peterzhang9595.github.io/MyWebsite/`

## 首次设置

在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中，将 Source 选择为 **GitHub Actions**。该外部设置由用户操作，工作流不会修改仓库设置。

本仓库已经完成此设置。首次推送时，构建、测试和生产构建均成功，但 `actions/configure-pages` 因 Pages 尚未启用而返回 `Not Found`。用户将 Source 设为 GitHub Actions 后重新运行任务，第 2 次尝试成功部署。该现象可以作为新仓库首次部署时的排障依据。

## 部署流程

`main` 分支推送或手动触发后，工作流拉取完整 Git 历史，使用 `.node-version`、Corepack 和锁定 pnpm，执行检查、单元测试、Chromium 浏览器测试与生产构建，然后上传 `dist/` 并部署。

完整 Git 历史用于计算文章首次发布和最近修改时间。`site` 固定为 `https://peterzhang9595.github.io`，`base` 固定为 `/MyWebsite`。

## 本地验证

```powershell
pnpm run check
pnpm run test:unit
pnpm run build
pnpm run preview
```

## 线上验证

2026-09-04 首次部署完成后，实际检查以下地址均返回 HTTP 200：

- 中文首页：<https://peterzhang9595.github.io/MyWebsite/>
- 英文首页：<https://peterzhang9595.github.io/MyWebsite/en/>
- Tip 详情：<https://peterzhang9595.github.io/MyWebsite/tips/understand-before-tools/>
- Pagefind：<https://peterzhang9595.github.io/MyWebsite/pagefind/pagefind.js>
- robots：<https://peterzhang9595.github.io/MyWebsite/robots.txt>

中文首页、英文首页和 Tip 详情的 canonical 均包含正确的 `/MyWebsite` 基础路径。以后每次部署不需要把这份人工检查机械地全部重复；涉及路由、base、SEO 或搜索的变更应重新检查对应地址。

## 常见问题

- 页面打开但资源 404：检查链接是否通过 base-path helper 生成。
- 日期缺失：确认 checkout 使用 `fetch-depth: 0`，或为迁移内容提供覆盖日期。
- 搜索无结果：确认 Astro 构建后执行了 Pagefind，并检查 `dist/pagefind/`。
- 暂停部署：在 GitHub Actions 中禁用 `deploy.yml`，或暂时移除 main push 触发；不要删除 Pages 历史。

自定义域名、DNS、Secrets 和第三方部署平台不在本需求范围。
