# GitHub Pages 部署说明

## 公开地址

`https://peterzhang9595.github.io/MyWebsite/`

## 首次设置

在 GitHub 仓库的 **Settings → Pages → Build and deployment** 中，将 Source 选择为 **GitHub Actions**。该外部设置由用户操作，工作流不会修改仓库设置。

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

## 常见问题

- 页面打开但资源 404：检查链接是否通过 base-path helper 生成。
- 日期缺失：确认 checkout 使用 `fetch-depth: 0`，或为迁移内容提供覆盖日期。
- 搜索无结果：确认 Astro 构建后执行了 Pagefind，并检查 `dist/pagefind/`。
- 暂停部署：在 GitHub Actions 中禁用 `deploy.yml`，或暂时移除 main push 触发；不要删除 Pages 历史。

自定义域名、DNS、Secrets 和第三方部署平台不在本需求范围。
