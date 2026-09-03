# Environment Setup Record

## Status

- Requirement: accepted
- Acceptance date: 2026-09-03
- Change type: user-level development toolchain and repository environment metadata

## Related documents

- [Source requirement](../requirements/2026-09-03-environment-setup.md)
- [Implementation roadmap](../implement-roadmap/2026-09-03-environment-setup.md)
- [Current environment](../env-list/environment.md)
- [Testing strategy](../testing-strategies/2026-09-03-testing-strategy.md)

The source requirement remained user-owned and was not edited by the assistant.

## Accepted result

The accepted development toolchain is:

| Tool | Accepted version | Management method |
| --- | --- | --- |
| Node.js | `24.20.0` LTS | Scoop `nodejs-lts` |
| npm | `11.19.0` | Bundled with Node.js |
| npx | `11.19.0` | Bundled with Node.js |
| Corepack | `0.35.0` | Bundled with Node.js |
| pnpm | `11.25.0` | Corepack Known Good Release |
| Git | `2.55.0.windows.2` | Scoop |

Google Chrome `152.0.7977.65` and Microsoft Edge `152.0.4191.53` were
confirmed available for future manual rendering checks. No browser automation
runtime was installed.

## Repository changes

- Created the root `.node-version` file with exact value `24.20.0`.
- Created `docs/env-list/environment.md` as the current environment source of
  truth.
- Created and executed
  `docs/implement-roadmap/2026-09-03-environment-setup.md`.
- Updated `docs/README.md` with a direct link to the environment document.

No `package.json`, lock file, Astro configuration, project dependency, test
source file, page, component, deployment workflow, or `src` file was created.
The existing `src/` directory remained empty.

## User-level environment changes

Node.js LTS was installed through Scoop at:

```text
C:\Scoop\apps\nodejs-lts\current
```

Corepack created the pnpm shim beside the Node.js installation and set its Known
Good Release to pnpm `11.25.0`.

## Bootstrap exception

Node.js `24.20.0` was installed before the implementation roadmap was created.
The user explicitly approved treating this as a one-time basic bootstrap
exception. All later installation and configuration actions followed the
documented roadmap and explicit approval checkpoints.

## pnpm version correction

The initial proposal selected pnpm `12.3.1` from Scoop's current pnpm manifest.
After activation, the user's PowerShell terminal selected pnpm `11.25.0`.
Systematic investigation established that:

- the user terminal resolved the expected Scoop Node.js and Corepack shims;
- the discrepancy was not caused by Conda, PATH, or another pnpm installation;
- npm registry metadata tagged `11.25.0` as the default stable `latest` release;
- pnpm `12.3.1` was tagged `latest-12`, not the general `latest` release;
- Corepack therefore updated its Known Good Release to `11.25.0` outside a
  project containing a `packageManager` declaration.

The assistant acknowledged the original version-selection error. The user
approved changing the exact pnpm version to `11.25.0`. Corepack was then
explicitly configured with:

```powershell
corepack install -g pnpm@11.25.0
```

The roadmap and current environment document were corrected before acceptance.

## Execution notes

The first `corepack enable pnpm` attempt failed because the running process had
inherited its PATH before Node.js was installed. Corepack's supported explicit
installation-directory option resolved the location without changing the chosen
architecture:

```powershell
corepack enable pnpm --install-directory C:\Scoop\apps\nodejs-lts\current
```

The first sandboxed pnpm launch could not reach the npm registry. The user
approved using the actual Windows user environment, where Corepack completed the
download and verification.

## Verification evidence

The final actual-user verification returned:

```text
node             v24.20.0
npm              11.19.0
npx              11.19.0
corepack         0.35.0
pnpm             11.25.0
corepack pnpm    11.25.0
git              git version 2.55.0.windows.2
```

The following additional checks passed:

- pnpm returned `11.25.0` from both `C:\Windows\System32` and the project root;
- Corepack `lastKnownGood.json` contained `11.25.0`;
- npm registry `dist-tags.latest` returned `11.25.0`;
- `.node-version` and the current environment document agreed on Node.js
  `24.20.0`;
- the roadmap and environment document agreed on pnpm `11.25.0`;
- all new relative Markdown links resolved;
- no unfinished placeholders or secret assignments were found;
- `package.json`, `pnpm-lock.yaml`, and Astro configuration remained absent;
- the existing `src/` directory contained no files.

Astro build, browser rendering, Vitest, Playwright, and GitHub Pages deployment
tests were intentionally omitted because the Astro project and project
dependencies were explicitly outside this requirement.

## Git status and authorization

No Git mutation was performed by the assistant. The user separately owns other
working-tree changes, including requirement filename changes, additional
requirements, and `avatar.jpg`; those changes were not modified or included in
this environment task.

The environment-related files are ready for the user to include in a Git update
after reviewing the working tree.

