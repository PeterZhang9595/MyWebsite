# Development Strategy Initialization Record

## Status

- Requirement: accepted
- Acceptance date: 2026-09-03
- Change type: documentation and project governance

## Source requirement

- [2026-09-03-development-strategy-init.md](../requirements/2026-09-03-development-strategy-init.md)

The source requirement remains user-owned and was not edited, renamed, or moved.

## Summary

This requirement established the documentation-first development workflow for
the personal website. It defines how requirements are clarified, how design and
implementation plans are approved, when code changes are authorized, how testing
is selected, when final documentation is updated, and which Git actions require
explicit permission.

## Repository changes

- Added the root [`AGENTS.md`](../../AGENTS.md) as the automatic project
  instruction entry point.
- Established the persistent
  [development strategy](../development/strategy.md).
- Established the internal [documentation index](../README.md).
- Established the active
  [testing strategy](../testing-strategies/2026-09-03-testing-strategy.md).
- Initialized the repository-root test structure with `unit/`, `integration/`,
  `e2e/`, `fixtures/`, `snapshots/`, and Git-ignored `artifacts/` directories.
- Replaced the empty `docs/decisions/` and `docs/update-records/` distinction
  with the unified `docs/records/` history area before this record was created.

No application source, dependency, build configuration, test code, or deployment
configuration was created or modified.

## Confirmed decisions

- `docs/requirements/` is read-only to the assistant unless a specific edit is
  explicitly authorized.
- New requirement, implementation roadmap, and record files use
  `YYYY-MM-DD-topic.md` and reuse the same date and topic when directly related.
- `AGENTS.md` references the development strategy instead of duplicating it.
- Code, page, build, test, and deployment tasks must also read the active testing
  strategy.
- Only an explicit implementation command authorizes changes to application
  code, tests, dependencies, build files, or deployment configuration.
- Git inspection is allowed, but Git mutations require explicit authorization.
  The assistant must proactively remind the user when an update is appropriate.
- Confirmed chat decisions must be consolidated into project documents before
  the task ends.
- Deployment documentation may be maintained proactively, while executable or
  external deployment changes require explicit authorization.
- `frontend-design` is a reference and quality constraint for visible work. Major
  visual tasks normally present two or three useful options and explain reference
  sources, adaptations, and trade-offs.
- Tests are selected by risk. Passing tests means the work is ready for user
  acceptance, not that it has already been accepted.
- `docs/documents/` describes the current implementation; `docs/records/`
  preserves accepted historical changes and decisions.
- Test source code belongs under the repository-root `tests/` directory.
- Temporary screenshots and debugging output belong under
  `tests/artifacts/YYYY-MM-DD-topic/` and will be Git-ignored when the test
  environment is initialized.
- Approved automated visual-regression baselines may be stored and tracked under
  `tests/snapshots/`.
- Only representative accepted screenshots used by current implementation
  documentation belong under `docs/documents/assets/YYYY-MM-DD-topic/`.
- `docs/env-list/environment.md` will record only the reproducible project
  environment and will never contain secrets or irrelevant machine state.
- Conflicts between new instructions and approved project rules must be surfaced
  for the user to resolve as a temporary exception or permanent rule change.

## Implementation roadmap exception

The user explicitly approved omitting a matching implementation roadmap for this
requirement. The work initialized governance documentation only and did not alter
application code or deployment behavior.

## Verification performed

The documentation-only Level 0 verification covered:

- required file existence and intended locations;
- relative Markdown links among the instruction and policy documents;
- scans for unfinished `TODO`, `TBD`, `FIXME`, and placeholder text;
- scans for obsolete or misspelled directory names;
- consistency of the test-code and screenshot-storage rules;
- confirmation that no test code or website implementation was introduced;
- review of the working-tree status and whitespace errors.

All performed Level 0 checks passed. Website builds, browser rendering, and
deployment tests were intentionally omitted because this requirement changed only
documentation and governance.

## Current-state documentation impact

No file was added to `docs/documents/` because this requirement did not implement
or change a website feature. The active current state of the documentation system
is already described by `docs/README.md`, `docs/development/strategy.md`, and the
active testing strategy.

## Git status

No staging, commit, branch, merge, push, pull, revert, tag, or release operation
was performed. The accepted governance documents are ready for the user to review
and include in a Git update together with any other intended untracked project
files.

## 历史修正

2026-09-04：需求文件后来统一补充了 `.md` 后缀，本记录同步修正相对链接；原有历史结论未改变。
