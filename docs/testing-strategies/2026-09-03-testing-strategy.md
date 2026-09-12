# Personal Website Testing Strategy

## 1. Purpose

This document defines the active testing and verification policy for the personal
website. Its goal is to provide enough evidence that approved work runs, renders,
and remains deployable without turning a personal static website into an
unnecessarily heavy testing project.

Read this document before changing source code, tests, pages, interactions, build
configuration, dependencies, or deployment configuration.

## 2. Core rules

- Store all test source code in the repository-root `tests/` directory, not in
  `src/`.
- Select tests according to the affected behavior and risk.
- Verify the user's approved requirement, not only the implementation's internal
  details.
- Use fresh test evidence before claiming that work passes or is complete.
- Do not run broad or expensive tests when a smaller relevant check provides
  sufficient evidence.
- Do not skip a necessary check merely because it is inconvenient.
- Report every meaningful test performed, its result, and every relevant test not
  performed with the reason.
- A passing test suite does not replace user acceptance.

## 3. Test levels

### Level 0: documentation-only changes

Use when no code, page, dependency, build, test, or deployment behavior changes.

Verify:

- required files exist in the correct directories;
- names follow the documented convention;
- relative links resolve to existing files;
- the documents do not contradict one another;
- no placeholders, unfinished sections, or undocumented confirmed decisions
  remain;
- Git diff contains only the intended documentation changes.

Do not run website tests or builds unless the documentation change affects a
machine-consumed file or explicitly requires them.

### Level 1: non-visual code changes

Use for utilities, content processing, configuration helpers, and behavior that
does not alter visible layout.

Run, as applicable:

- focused unit or integration tests for the changed behavior;
- Astro and TypeScript checks;
- the production build.

For features and bug fixes with clear programmatic behavior, use a test-first
workflow where practical. Do not create artificial unit tests for markup or
configuration when a build or browser check is more meaningful.

When the Superpowers methodology is active and implementation has been
authorized, test-first becomes the default rather than an option. Markup-only,
copy, and content tasks remain exempt. All test code still lives in the
repository-root `tests/` directory. See section 16 of the
[development strategy](../development/strategy.md) for the full compatibility
rules and the exceptions.

### Level 2: page, style, or interaction changes

Run the applicable Level 1 checks, then inspect actual browser rendering.

At minimum verify:

- one representative desktop viewport;
- one representative mobile viewport;
- affected content, layout, typography, and imagery;
- keyboard focus and primary interaction paths;
- reduced-motion behavior when animation is involved;
- absence of obvious overflow, clipping, layout shift, or console errors.

Capture temporary screenshots for comparison and user review under
`tests/artifacts/YYYY-MM-DD-topic/`. Do not commit them. After user acceptance,
retain only representative final screenshots required by `docs/documents/`.

### Level 3: routes, navigation, localization, or shared flows

Use browser automation or an equivalent repeatable interaction check for affected
flows. Verify, as applicable:

- internal links and navigation;
- direct access to generated routes;
- Chinese and English route pairing;
- language switch behavior and fallback behavior;
- page language metadata and relevant SEO links;
- history navigation and refresh behavior;
- missing-content and 404 behavior.

Do not retest every page when a representative subset plus focused route checks
provides sufficient coverage.

### Level 4: deployment changes

Deployment documentation alone remains Level 0. Executable deployment changes
require explicit implementation authorization.

For an authorized deployment change, verify:

- a clean production build succeeds;
- generated paths and asset URLs match the GitHub Pages site and base-path model;
- the deployment workflow and referenced scripts are syntactically and
  structurally consistent;
- the expected output directory is produced;
- secrets are not embedded in source or generated static assets;
- deployment-specific redirects, domains, or base paths are checked when they are
  in scope.

A live deployment, GitHub repository setting change, Pages setting change, domain
change, DNS change, or secret change requires separate explicit authorization.

### Level 5: high-risk or cross-cutting changes

Use the complete relevant test suite when a change affects multiple major areas,
shared layout, content generation, language routing, build tooling, critical
dependencies, or deployment foundations.

Combine focused tests, static checks, production build, browser flows, and visual
inspection as appropriate. Explain why full-suite verification is warranted.

## 4. Choosing the test scope

Before implementation, the design or implementation roadmap should identify:

- affected behavior;
- expected test level;
- focused tests to add or update;
- required rendering checks;
- deployment verification, if any;
- checks intentionally omitted and why.

If implementation expands beyond the approved scope, reconsider the test level
and request renewed authorization when the implementation scope materially
changes.

Topic-specific testing guidance lives alongside this document in
`testing-strategies/`. Read it in addition to this policy when the topic matches:

- [`2026-09-12-rich-content-rendering.md`](2026-09-12-rich-content-rendering.md):
  rendering matrix for images, code blocks, and math across every container that
  renders them, plus the assertion rules for geometry, overflow, and theme.

## 5. Visual verification and screenshots

Visual verification must compare the result against the approved design, not
against generic aesthetic preferences.

Use the following repository-root test structure as applicable:

```text
tests/
├─ unit/
├─ integration/
├─ e2e/
├─ fixtures/
├─ snapshots/
└─ artifacts/
```

- `unit/`, `integration/`, and `e2e/` contain executable test source code.
- `fixtures/` contains stable inputs intentionally required by tests.
- `snapshots/` contains baselines only when an approved automated
  visual-regression test consumes them. These baselines may be tracked by Git.
- `artifacts/YYYY-MM-DD-topic/` contains ordinary test screenshots, failure
  screenshots, traces, and debugging output. It is temporary and must be ignored
  by Git once the test environment is initialized.

Do not place test code or test-only screenshot output in `src/`.

Once the user accepts a visual result, copy or export only representative final
screenshots needed by current implementation documentation to:

`docs/documents/assets/YYYY-MM-DD-topic/`

Normally retain only the desktop and mobile images needed to explain the current
result. Avoid duplicate screenshots and large image histories in Git. Test
artifacts do not become documentation merely because they exist.

## 6. Failure handling

When a check fails or behavior differs from expectations:

1. report the failure accurately;
2. investigate the root cause before proposing a fix;
3. do not hide, weaken, or delete a valid test merely to obtain a passing result;
4. update the implementation or approved documentation as appropriate;
5. rerun the failed check and any affected related checks;
6. do not claim success until fresh evidence confirms it.

If a required test cannot run because of environment, permission, network, tool,
or external-service constraints, report the exact limitation and the remaining
risk. Do not silently replace the required evidence with an assumption.

## 7. Test report format

Every implementation delivery must include a concise test report containing:

1. **Scope tested** — the features, pages, routes, or configuration covered.
2. **Checks performed** — the commands, browser actions, inspections, or
   deployment validations actually run.
3. **Results** — pass, fail, warning, or blocked, supported by fresh evidence.
4. **Visual evidence** — previews or screenshots when visible behavior changed.
5. **Checks omitted** — relevant checks not run and the reason.
6. **Residual risk** — anything the user should verify or monitor.

Do not describe a check as passing if it was not executed during the current
verification round.

## 8. Acceptance and documentation

After testing, deliver the result to the user for review. Test success means the
work is ready for user acceptance, not that the requirement is complete.

Only after explicit user acceptance:

- update affected current implementation documents;
- preserve representative final screenshots when needed;
- create the matching historical record;
- remind the user to perform the appropriate Git update.
