# Environment Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> `superpowers:executing-plans` to execute this plan task by task. Do not delegate
> to subagents unless the user explicitly requests delegation. Track execution
> with the checkboxes in this document.

**Goal:** Establish a reproducible Node.js and pnpm toolchain for future Astro
development without initializing the Astro website or installing project
dependencies.

**Architecture:** Install the Node.js runtime at user scope through Scoop, manage
the exact pnpm version through Node's bundled Corepack, and keep reproducibility
metadata in the repository. Record the verified environment in one current-state
document while leaving Astro scaffolding, package dependencies, tests, and
deployment configuration to later requirements.

**Tech Stack:** Windows, PowerShell, Scoop, Node.js 24.20.0 LTS, Corepack 0.35.0,
pnpm 11.25.0, Git 2.55.0.windows.2, Chrome, Edge

**Spec:**
[`docs/requirements/2026-09-03-environment-setup.md`](../requirements/2026-09-03-environment-setup.md)

## Global constraints

- This requirement configures only the local runtime and package-management
  toolchain.
- Do not initialize Astro or create application code.
- Do not create `package.json`, Astro configuration, content collections, pages,
  components, styles, GitHub Actions, or deployment configuration.
- Do not install Astro, TypeScript, Vitest, Playwright, linters, formatters, or
  other project dependencies.
- Explain every installation or activation step and obtain explicit user approval
  before executing it.
- Treat `docs/requirements/` as read-only.
- Do not alter or discard unrelated working-tree changes, including `avatar.jpg`
  and other requirement files.
- Do not stage, commit, create or merge branches, push, pull, or modify Git
  history without explicit Git authorization.
- Use exact runtime recommendations while allowing an explicit compatibility
  range to be added later when `package.json` is created.
- Record no secrets, credentials, or irrelevant machine-specific software in the
  environment document.

## Approved decisions

- Node.js is installed through Scoop at user scope.
- The exact recommended Node.js version is `24.20.0`.
- A repository-root `.node-version` file will contain `24.20.0`.
- When the later website setup creates `package.json`, its intended Node engine
  range is `>=24.20.0 <25`.
- pnpm is the project package manager.
- Corepack manages pnpm rather than a separate Scoop pnpm installation.
- The exact pnpm version is `11.25.0`.
- When the later website setup creates `package.json`, it will declare
  `"packageManager": "pnpm@11.25.0"`.
- Existing Chrome and Edge installations are sufficient for future manual page
  inspection; this requirement installs no browser or browser automation runtime.
- Astro project initialization and test dependencies belong to the separate
  `website-setup` requirement.

## One-time bootstrap exception

Node.js 24.20.0 was installed through Scoop before this roadmap was written. The
user explicitly approved recording that action as a one-time bootstrap exception.

The installation completed successfully at:

`C:\Scoop\apps\nodejs-lts\current`

The installation included:

- Node.js `24.20.0`;
- npm `11.19.0`;
- npx `11.19.0`;
- Corepack `0.35.0`.

The user's persistent PATH contains the Scoop Node.js directories. The currently
running Codex process inherited its PATH before installation, so direct command
discovery in that process remains stale until the host application or terminal
is restarted. Verification with the refreshed user PATH successfully located and
ran all four tools.

No further installation may occur until this roadmap is reviewed and the user
explicitly approves the relevant execution step.

## Planned file structure

**Create:**

- `.node-version` — exact recommended Node.js version for local development and
  CI configuration.
- `docs/env-list/environment.md` — current reproducible environment, installation
  locations, version policy, verification commands, and upgrade procedure.

**Modify:**

- `docs/README.md` — add a direct link to the current environment document after
  it exists.

**Create only after user acceptance:**

- `docs/records/2026-09-03-environment-setup.md` — accepted historical record,
  bootstrap exception, executed commands, verification evidence, and deviations.

**Do not create or modify:**

- `src/`;
- project test source files;
- `package.json` or a lock file;
- Astro or TypeScript configuration;
- `.github/` deployment workflows;
- the source requirement.

---

### Task 1: Confirm the installed Node.js baseline

**Files:**

- Create: `.node-version`
- Read: `docs/requirements/2026-09-03-environment-setup.md`

**Interfaces:**

- Consumes: Scoop-installed Node.js at
  `C:\Scoop\apps\nodejs-lts\current`.
- Produces: repository recommendation `24.20.0` for later local and CI setup.

- [x] **Step 1: Explain the repository version marker**

  Tell the user that `.node-version` is a small text file used by compatible
  version managers and CI configuration to identify the project's recommended
  Node.js version. It does not install Node and does not affect other projects.

- [x] **Step 2: Obtain explicit permission to create `.node-version`**

  Wait for the user to authorize this project-level configuration file.

- [x] **Step 3: Verify the installed runtime through its Scoop path**

  Run:

  ```powershell
  & 'C:\Scoop\apps\nodejs-lts\current\node.exe' --version
  & 'C:\Scoop\apps\nodejs-lts\current\npm.cmd' --version
  & 'C:\Scoop\apps\nodejs-lts\current\npx.cmd' --version
  & 'C:\Scoop\apps\nodejs-lts\current\corepack.cmd' --version
  ```

  Expected output:

  ```text
  v24.20.0
  11.19.0
  11.19.0
  0.35.0
  ```

- [x] **Step 4: Create the exact Node version marker**

  Create `.node-version` with exactly:

  ```text
  24.20.0
  ```

- [x] **Step 5: Verify the marker**

  Read `.node-version` and confirm that its trimmed content equals `24.20.0`.

### Task 2: Enable and pin pnpm through Corepack

**Files:**

- No repository file is created by the Corepack activation itself.
- Later project metadata will be created by the separate `website-setup`
  requirement.

**Interfaces:**

- Consumes: Corepack `0.35.0` bundled with Node.js `24.20.0`.
- Produces: user-level `pnpm` command resolving to pnpm `11.25.0`.

- [x] **Step 1: Explain the Corepack activation**

  Tell the user that Corepack creates package-manager shims beside Node.js and
  downloads the selected pnpm release into its managed cache. This changes the
  user-level Node toolchain but does not create an Astro project or install
  website dependencies.

- [x] **Step 2: Obtain explicit permission to activate pnpm**

  Wait for the user to approve enabling Corepack's pnpm shim and downloading
  pnpm `11.25.0`.

- [x] **Step 3: Enable the pnpm shim**

  Run in the actual user environment:

  ```powershell
  corepack enable pnpm
  ```

  If the currently running process has a stale PATH, invoke Corepack through:

  ```powershell
  & 'C:\Scoop\apps\nodejs-lts\current\corepack.cmd' enable pnpm
  ```

- [x] **Step 4: Install the exact Corepack-managed pnpm version**

  Run:

  ```powershell
  corepack install -g pnpm@11.25.0
  ```

  With a stale PATH, run:

  ```powershell
  & 'C:\Scoop\apps\nodejs-lts\current\corepack.cmd' install -g pnpm@11.25.0
  ```

- [x] **Step 5: Verify the selected package manager**

  Run with a refreshed user PATH:

  ```powershell
  pnpm --version
  corepack pnpm --version
  ```

  Expected result: both commands report `11.25.0`.

  Execution note: the first shim-enable attempt failed because the running
  process had inherited its PATH before Node.js was installed. The successful
  retry used Corepack's supported `--install-directory` option. The first
  sandboxed pnpm launch could not reach the npm registry. The initial version
  choice of `12.3.1` came from Scoop's package manifest, but registry metadata
  showed that `12.3.1` was tagged `latest-12` while the default stable `latest`
  tag was `11.25.0`. Corepack therefore updated its Known Good Release to
  `11.25.0` in the user's terminal. The user approved correcting the plan to the
  default stable release, and both pnpm entry points were then verified at
  `11.25.0`.

### Task 3: Verify the environment boundary

**Files:**

- Read: repository root and existing `tests/` structure
- Do not create test source files for this environment-only verification.

**Interfaces:**

- Consumes: installed Node.js and Corepack-managed pnpm.
- Produces: verification evidence that the future Astro setup has a usable base
  toolchain without creating the website.

- [x] **Step 1: Verify Node can execute JavaScript**

  Run:

  ```powershell
  node -e "console.log(process.version)"
  ```

  Expected output: `v24.20.0`.

- [x] **Step 2: Verify package-manager commands**

  Run:

  ```powershell
  npm --version
  pnpm --version
  corepack --version
  ```

  Expected output:

  ```text
  11.19.0
  11.25.0
  0.35.0
  ```

- [x] **Step 3: Verify future manual-rendering browsers exist**

  Confirm that these installed paths remain available:

  ```text
  C:\Program Files\Google\Chrome\Application\chrome.exe
  C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe
  ```

  Do not launch or modify either browser for this task.

- [x] **Step 4: Verify the task did not initialize the website**

  Confirm that this requirement did not create `package.json`, a lock file,
  Astro configuration, or files under `src/`.

  Execution note: `src/` already existed as an empty user-created directory
  before this requirement. The environment task did not create files inside it.

### Task 4: Document the current environment

**Files:**

- Create: `docs/env-list/environment.md`
- Modify: `docs/README.md`

**Interfaces:**

- Consumes: verified versions and installation evidence from Tasks 1–3.
- Produces: the current source of truth for the reproducible project environment.

- [x] **Step 1: Create the environment document**

  Include:

  - last verification date;
  - supported development operating system;
  - Node.js, npm, npx, Corepack, pnpm, and Git versions;
  - Chrome and Edge availability;
  - installation and management method for each tool;
  - `.node-version` policy;
  - intended future `engines.node` and `packageManager` values;
  - commands for version verification;
  - PATH refresh guidance;
  - upgrade procedure;
  - explicitly deferred Astro and test dependencies;
  - confirmation that no secrets are required at this stage;
  - a link to this roadmap and the source requirement.

- [x] **Step 2: Update the documentation index**

  Add a direct relative link from `docs/README.md` to
  `env-list/environment.md`. Preserve the existing distinction between project
  introduction and internal documentation.

- [x] **Step 3: Check environment-document safety**

  Confirm the document contains no API keys, credentials, private tokens,
  unnecessary user-specific paths, or copied transitive dependency lists.

### Task 5: Perform risk-based verification

**Files:**

- Verify: `.node-version`
- Verify: `docs/env-list/environment.md`
- Verify: `docs/README.md`

**Interfaces:**

- Consumes: all approved environment changes.
- Produces: delivery evidence for user acceptance.

- [x] **Step 1: Run environment verification**

  Re-run all version commands from Tasks 1–3 with a refreshed user PATH and
  confirm the exact expected versions.

- [x] **Step 2: Run Level 0 documentation verification**

  Check:

  - required files exist;
  - relative Markdown links resolve;
  - no unfinished placeholders remain;
  - `.node-version` and `environment.md` agree;
  - the source requirement was not modified;
  - no secrets were written;
  - no unintended Astro or test files were created.

- [x] **Step 3: Review Git status without modifying it**

  Run read-only status and diff checks. Separate files produced by this
  requirement from unrelated user changes. Do not stage or commit anything.

- [x] **Step 4: Report intentionally omitted tests**

  State that Astro build, page rendering, Playwright, Vitest, and GitHub Pages
  deployment checks were omitted because the Astro project and its dependencies
  are explicitly outside this requirement.

### Task 6: Deliver for acceptance and close the requirement

**Files:**

- Create after acceptance: `docs/records/2026-09-03-environment-setup.md`
- Update after acceptance only if affected: current documentation indexes

**Interfaces:**

- Consumes: implementation and verification evidence from Tasks 1–5.
- Produces: accepted historical record and Git update reminder.

- [x] **Step 1: Deliver the environment result**

  Report installed versions, configuration files, verification results, omitted
  checks, PATH restart guidance, and any remaining risks.

- [x] **Step 2: Wait for explicit user acceptance**

  Do not create the final record or describe the requirement as complete before
  the user explicitly accepts it.

- [x] **Step 3: Create the accepted historical record**

  After acceptance, create
  `docs/records/2026-09-03-environment-setup.md`. Include the Node bootstrap
  exception, actual commands, final versions, verification evidence, omissions,
  deviations from this roadmap, and links to the requirement, roadmap, and
  environment document.

- [x] **Step 4: Remind the user to update Git**

  Review Git status and suggest the exact environment and documentation files to
  include plus a concise commit message. Do not perform the Git operation unless
  the user separately authorizes it.
