# Project Development Environment

## Status

- Last verified: 2026-09-03
- Development platform: Windows 11 (`10.0.26200.0`)
- Shell used for verification: PowerShell `7.6.4`
- Environment scope: runtime and package-management toolchain only

This document is the current source of truth for the reproducible development
environment. It intentionally does not describe Astro packages or website test
dependencies because those belong to the separate website setup requirement.

## Related documents

- [Source requirement](../requirements/2026-09-03-environment-setup.md)
- [Implementation roadmap](../implement-roadmap/2026-09-03-environment-setup.md)
- [Testing strategy](../testing-strategies/2026-09-03-testing-strategy.md)

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

Browser versions are observations rather than project locks. Browser automation
runtimes are not installed by this requirement.

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

## Deferred environment

The following are intentionally deferred to the website setup requirement:

- Astro and Astro integrations;
- TypeScript project configuration;
- `package.json` and `pnpm-lock.yaml`;
- formatting and linting tools;
- Vitest and test libraries;
- Playwright and browser automation binaries;
- Astro pages, components, layouts, content, and styles;
- GitHub Pages build and deployment configuration.

No C++ compiler, Python build environment, Docker runtime, database, or other
native toolchain is required at this stage.

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
