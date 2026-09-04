# Project Development Environment

## Status

- Last verified: 2026-09-04
- Development platform: Windows 11 (`10.0.26200.0`)
- Shell used for verification: PowerShell `7.6.4`
- Environment scope: runtime、包管理器、网站依赖与自动化测试工具链

This document is the current source of truth for the reproducible development
environment. 网站基础版本的依赖和验证命令已经在本文后半部分补充，并与
`package.json`、`pnpm-lock.yaml` 和 `pnpm-workspace.yaml` 保持一致。

## Related documents

- [Source requirement](../requirements/2026-09-03-environment-setup.md)
- [Implementation roadmap](../implement-roadmap/2026-09-03-environment-setup.md)
- [Testing strategy](../testing-strategies/2026-09-03-testing-strategy.md)
- [网站架构与维护接口](../documents/website-architecture.md)
- [网站基础版本实现记录](../records/2026-09-03-website-setup.md)

## Required toolchain

| Tool | Verified version | Management method | Purpose |
| --- | --- | --- | --- |
| Node.js | `24.20.0` LTS | Scoop `nodejs-lts` | JavaScript runtime for future Astro development, builds, and tests |
| npm | `11.19.0` | Bundled with Node.js | Bootstrap and compatibility package-management command |
| npx | `11.19.0` | Bundled with Node.js | Execute npm package binaries when explicitly required |
| Corepack | `0.35.0` | Bundled with Node.js | Select and reproduce the approved pnpm version |
| pnpm | `11.25.0` | Corepack | Primary package manager for the website project |
| Git | `2.55.0.windows.2` | Scoop | Source history and collaboration |

## Browser availability

Existing browsers are sufficient for future manual rendering checks:

| Browser | Verified file version | Current role |
| --- | --- | --- |
| Google Chrome | `152.0.7977.65` | Primary manual rendering check |
| Microsoft Edge | `152.0.4191.53` | Secondary Chromium compatibility check |

Browser versions are observations rather than project locks. 网站基础版本后续已经安装
Playwright Chromium、Firefox 和 WebKit 运行时；Chromium 与 WebKit 在当前主机可运行，
Firefox 启动受到下文记录的主机限制。

## Installation layout

Node.js is installed through Scoop at:

```text
C:\Scoop\apps\nodejs-lts\current
```

The `current` path is a Scoop-managed link to the installed Node.js LTS release.
Corepack places the pnpm command shim beside the Node.js installation and manages
the selected pnpm release in its own cache.

Do not commit Node.js, pnpm binaries, Corepack caches, or other system tool files
to this repository.

## Repository version policy

The repository-root `.node-version` file contains the exact recommended runtime:

```text
24.20.0
```

When the later website setup creates `package.json`, use the intended compatibility
metadata:

```json
{
  "engines": {
    "node": ">=24.20.0 <25"
  },
  "packageManager": "pnpm@11.25.0"
}
```

The exact `.node-version` value provides a reproducible recommendation for local
development and CI. The Node engine range allows compatible Node 24 security and
patch releases. pnpm remains exactly pinned because different pnpm versions can
change lockfile behavior.

## PATH behavior

Scoop has added the Node.js directories to the persistent user PATH. Terminals or
applications opened before the installation may retain an older process PATH and
fail to discover `node`, `npm`, `npx`, `corepack`, or `pnpm`.

Preferred recovery:

1. close the old terminal;
2. open a new PowerShell window;
3. rerun the version checks below.

For diagnostics only, an existing PowerShell process can refresh its PATH from
the persistent user and machine values:

```powershell
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'User') + ';' +
  [Environment]::GetEnvironmentVariable('Path', 'Machine')
```

## Verification commands

Run in a newly opened PowerShell terminal:

```powershell
node --version
npm --version
npx --version
corepack --version
pnpm --version
corepack pnpm --version
git --version
```

Expected package-tool output for this environment:

```text
v24.20.0
11.19.0
11.19.0
0.35.0
11.25.0
11.25.0
git version 2.55.0.windows.2
```

## Upgrade procedure

Runtime upgrades are deliberate maintenance tasks, not automatic project
changes.

1. Review the target Node.js LTS or pnpm release and its compatibility notes.
2. Update Node.js through Scoop when a Node upgrade is approved.
3. Update the exact `.node-version` recommendation.
4. Update the future `engines.node` range only when the supported Node line
   changes.
5. Install the approved pnpm version through Corepack and update the future
   `packageManager` field.
6. Reinstall project dependencies after the website project exists.
7. Run the applicable checks, production build, and browser tests.
8. Update this document and create the matching accepted historical record.

Do not leave Node.js pinned indefinitely to an unsupported patch release. Exact
version recording makes upgrades reviewable; it is not a reason to avoid security
updates.

## 当前不需要的环境

网站基础版本不需要 C++ 编译器、Python 构建环境、Docker、数据库或其它服务端运行时。
当前也没有格式化器或独立 lint 工具；代码有效性由 Astro Check、TypeScript、Vitest、
Playwright 和生产构建共同验证。以后新增原生依赖、服务端能力或格式化工具时，需要按
开发策略单独评估并更新本文档。

## Secrets and environment variables

No secret or project environment variable is required for the current toolchain.
Future variable names may be documented here when needed, but secret values and
credentials must never be committed.

## Bootstrap exception

Node.js `24.20.0` was installed before the implementation roadmap was written.
The user approved treating this as a one-time basic bootstrap exception. All
subsequent environment actions returned to the documented approval and roadmap
workflow.

During pnpm activation, the first `corepack enable pnpm` attempt could not locate
Corepack because the running process had inherited its PATH before Node.js was
installed. The retry used Corepack's explicit `--install-directory` option. The
first sandboxed pnpm launch could not reach the npm registry.

The initial pnpm version choice of `12.3.1` was based on Scoop's current pnpm
manifest. Subsequent registry inspection showed that `12.3.1` was tagged
`latest-12`, while npm's default stable `latest` tag was `11.25.0`. Corepack
correctly selected `11.25.0` as its Known Good Release outside a project with a
`packageManager` declaration. The user approved adopting `11.25.0`, and the
Corepack default and both pnpm command entry points were verified at that version.

## 网站项目依赖（2026-09-04 更新）

网站基础版本已经初始化。直接运行依赖为 Astro `7.2.10`、`@astrojs/mdx` `8.0.0`、`@astrojs/markdown-remark` `7.3.0`、`@astrojs/sitemap` `3.7.4`、KaTeX 管线、`@lucide/astro` `1.40.0` 和 Sharp `0.35.4`。开发依赖包括 Astro Check、TypeScript `6.0.3`、Node 24 类型、Pagefind `1.5.2`、Vitest `4.1.11`、Playwright `1.62.1` 与 axe-core Playwright `4.13.0`。

Astro 原计划使用 `7.3.0`，但该版本的 Image 插件会导入未公开的 `astro/_internal/logger`，导致生产构建失败。用户明确批准回退并精确锁定到不存在该回归的 `7.2.10`。

pnpm 11.25 的依赖构建许可保存在 `pnpm-workspace.yaml`，允许 `esbuild` 和 `sharp` 执行必要安装脚本。当前 Codex 进程可能仍需要临时刷新 PATH，并设置 `ASTRO_TELEMETRY_DISABLED=1` 以避免沙箱外写入。

项目验证命令：

```powershell
pnpm run check
pnpm run test:unit
pnpm run build
pnpm run test:e2e
pnpm run test:e2e:webkit
```

Firefox Playwright 运行时已下载，但在当前 Windows 主机上启动时报 `spawn UNKNOWN`；Chromium 与 WebKit 可正常运行。该限制不影响 GitHub Actions Ubuntu 环境继续尝试 Chromium 验证。
