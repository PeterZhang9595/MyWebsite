# Personal Website Development Strategy

## 1. Purpose and authority

This document defines the persistent development workflow for the personal
website. It is a project-level instruction document referenced by the repository
root `AGENTS.md`.

The user owns the product direction, requirements, design approval, implementation
authorization, acceptance decision, and Git history. The assistant supports the
user by clarifying requirements, presenting design and technical options,
maintaining project documentation, implementing explicitly approved work, and
providing verification evidence.

This strategy must be followed unless the user explicitly approves a temporary
exception or a permanent rule change. Platform safety policies and higher-level
system constraints always take precedence.

## 2. Long-term project objective

The project is a personal website intended to be maintained throughout the
user's career. It will present personal information, projects, study notes, and
other selected content. Development must therefore favor:

- clear and maintainable structure;
- traceable requirements and decisions;
- restrained dependency growth;
- accessible and responsive pages;
- reproducible builds and deployments;
- documentation that reflects both the current implementation and its history;
- deliberate visual design without generic, template-like, or excessive
  AI-generated styling.

## 3. Mandatory reading

Before performing work in this repository, read this strategy.

For tasks involving source code, tests, pages, rendering, build configuration,
dependencies, or deployment, also read:

`docs/testing-strategies/2026-09-03-testing-strategy.md`

Read any requirement, design, implementation roadmap, environment document, or
current implementation document relevant to the requested work before proposing
changes.

## 4. Ownership of requirements

`docs/requirements/` is the user's original requirement area.

- Requirement files are user-owned and read-only by default.
- The assistant must not edit, rename, move, or delete a requirement file unless
  the user explicitly authorizes that exact operation.
- Ambiguities, contradictions, and missing decisions must be discussed with the
  user rather than silently resolved.
- Clarifications confirmed in chat must be written into the appropriate derived
  design, development, roadmap, testing, deployment, environment, or record
  document. They must not be inserted into the original requirement without
  permission.

## 5. Standard development lifecycle

Every new requirement follows this lifecycle unless the user explicitly approves
an exception:

1. **Read and classify**
   - Read the relevant requirement and existing project documents.
   - Determine whether the work is documentation-only, design work, a bounded
     code change, or an architectural change.
2. **Clarify**
   - Identify unclear requirements, conflicts, missing success criteria, and
     decisions that materially affect the result.
   - Ask the user to resolve them before implementation.
3. **Explore options**
   - Present meaningful alternatives and trade-offs where choices exist.
   - Give a recommendation with reasons, without treating it as user approval.
4. **Prepare derived documentation**
   - Put approved visual and interaction decisions in `docs/design/`.
   - Create a matching implementation roadmap in `docs/implement-roadmap/`
     when implementation work is required.
   - Update long-term strategy, environment, testing, or deployment documents
     when the requirement changes those areas.
5. **User review of design and roadmap**
   - Ask the user to review the derived documentation.
   - Revise it until the user approves it.
6. **Explicit implementation authorization**
   - Do not modify application code, tests, dependencies, build configuration,
     or deployment configuration until explicit authorization is given.
7. **Implementation**
   - Implement only the approved scope.
   - Stop and request renewed approval if the scope materially expands.
8. **Testing and verification**
   - Select tests according to the project testing strategy and the risk of the
     change.
   - Report actual commands or checks, outcomes, failures, and omissions.
9. **Delivery for user acceptance**
   - Present the implementation, verification evidence, and relevant screenshots
     or previews.
   - At this stage the work is awaiting acceptance, even if all tests pass.
10. **Post-acceptance documentation**
    - Only after the user explicitly accepts the result, update the current
      implementation documentation in `docs/documents/` and create the matching
      historical record in `docs/records/`.
11. **Git reminder**
    - Review Git status and remind the user that a Git update is appropriate.
    - Suggest the files to include and a concise commit message.
    - Do not perform Git mutations without explicit authorization.

## 6. Explicit development authorization

Only an unambiguous instruction such as "批准实现", "开始开发", or another
equally explicit command authorizes implementation changes.

Statements such as "继续", "完善一下", "看起来可以", or general approval of a
discussion authorize only the current documentation or design phase. They do not
authorize changes to:

- `src/` or other application source files;
- tests;
- dependencies or lock files;
- build tooling;
- GitHub Actions or deployment configuration;
- external repository, Pages, domain, DNS, or secret settings.

If implementation discovers a material scope increase, new dependency, changed
public interface, or design departure, stop and request renewed approval.

## 7. Documentation map

### `docs/deployment/`

Maintain GitHub Pages deployment requirements, procedures, troubleshooting, and
operational guidance. The assistant may research and update deployment
documentation, but executable deployment configuration still requires explicit
implementation authorization. Changes to GitHub settings, Pages settings,
domains, DNS, secrets, or other external state require separate explicit
authorization.

### `docs/design/`

Organize design documentation by design object, such as typography, color,
layout, imagery, motion, responsive behavior, and interaction. Record approved
design decisions before implementation.

### `docs/documents/`

Describe the website as it currently exists. Documentation must explain how each
part is implemented, where its modification interfaces are, what it depends on,
and what result it produces. Keep it clear and detailed in the style of official
technical documentation.

This directory is current-state documentation, not a changelog. Update outdated
descriptions after accepted changes rather than preserving obsolete behavior.

For accepted visual work, store only representative final screenshots under:

`docs/documents/assets/YYYY-MM-DD-topic/`

### `docs/development/`

Maintain this single `strategy.md` as the persistent development strategy. Put
long-term process rules here instead of duplicating them in `AGENTS.md`.

### `docs/requirements/`

Contains the user's original requirements and ideas. It is read-only to the
assistant unless a specific edit is explicitly authorized.

### `docs/records/`

Maintain one historical record for every accepted requirement that produced a
repository change, including documentation-only and governance work. Records
describe what changed, why important choices were made, which tests ran, any
departures from the approved plan, and links to related documents.

Records are historical artifacts. Do not rewrite them to represent the current
state. Correct factual errors only when necessary and note the correction.

### `docs/implement-roadmap/`

Normally create one implementation roadmap for every requirement, using the same
date and topic. A roadmap may be omitted only after explaining why it adds no
meaningful value and receiving the user's explicit approval.

The `2026-09-03-development-strategy-init` requirement is an approved historical
exception: it does not require an implementation roadmap because it initializes
documentation governance and does not modify application code or deployment
configuration.

### `docs/testing-strategies/`

Maintain the active testing policy and any future testing-specific guidance.
Code, page, build, and deployment tasks must follow the active testing strategy.

### `docs/env-list/`

Maintain a single current environment document at
`docs/env-list/environment.md`. Record the reproducible project environment:
required runtime and tool versions, direct dependencies, supported platforms,
environment variable names and purposes, external tools, verification date, and
reasons for environment changes.

Never record secret values, credentials, irrelevant machine software, unnecessary
absolute user paths, or a copy of the complete transitive dependency tree.

## 8. Naming and traceability

New requirement, roadmap, and record documents use:

`YYYY-MM-DD-topic.md`

Related documents reuse the same date and topic whenever their relationship is
one-to-one. They must link to one another with relative Markdown links where
practical.

Files created before this convention, including a requirement without a `.md`
extension, may remain as historical exceptions unless the user explicitly asks
for them to be renamed.

Design and current implementation documents may be organized by stable subject
rather than by requirement when that better represents their purpose.

## 9. Chat decisions and documentation synchronization

Conversation history is not a durable project specification.

- A proposal in chat becomes a project decision only after user confirmation.
- Confirmed requirements, constraints, choices, exceptions, and permission
  boundaries must be incorporated into the appropriate project document.
- Consolidate decisions after a clarification round rather than editing a file
  after every sentence.
- Any additional confirmed decisions must be synchronized before the current task
  ends. Do not knowingly carry undocumented decisions into a later task.
- Before declaring a task ready for review, compare the original requirement and
  confirmed chat decisions against the written documentation.

## 9.1 文档语言

助手新生成的项目文档必须统一使用简体中文。代码标识符、命令、路径、配置键、包名、公开 URL 和专有名词在翻译会降低准确性时可以保留原文。

助手对现有文档进行实质重写时，重写后的文档也必须使用简体中文。此前已经形成的英文历史文档可以作为历史例外保留，除非用户明确要求翻译。用户编写的需求文件继续保持只读，未经具体授权不得翻译或重写。

## 10. Frontend design process

Use the `frontend-design` skill as a design reference and quality constraint for
new pages, page redesigns, typography, color, layout, animation, responsive
behavior, and other user-visible interactions.

The skill does not replace user direction and must not silently overturn an
approved visual decision. The design process must also research and learn from
appropriate reference websites.

For substantial visual work, normally present two or three materially different
options:

1. a recommended direction suited to the user's identity and long-term goals;
2. a conservative direction with lower implementation and maintenance cost;
3. when useful, an experimental direction with clearly stated trade-offs.

Small choices such as a single color or type detail normally need only two useful
options. Do not manufacture weak alternatives merely to reach a target count.

For every option, identify reference sources, the principles being borrowed, how
they are adapted to this website, and the consequences for distinctiveness,
maintenance, responsiveness, performance, and accessibility. Borrow principles,
not unlicensed assets or wholesale copies of another person's design.

Pure copy edits, article content changes, spelling corrections, and internal
refactors that do not change visible behavior do not require a new design
document.

## 11. Implementation quality

- Keep source files focused and avoid unnecessarily large components.
- Prefer clear module boundaries and explicit interfaces.
- Reuse shared behavior only when it is genuinely shared; avoid premature
  abstraction.
- Add dependencies only when their benefit exceeds their maintenance cost.
- Preserve static rendering and graceful degradation wherever possible.
- Keep essential content usable when optional JavaScript, animation, comments,
  analytics, or third-party services fail.
- Follow the approved design and roadmap rather than improvising a different
  product during implementation.

## 12. Testing and evidence

Testing must be proportional to risk. Follow the active testing strategy rather
than running every possible test for every change.

Tests should establish, as applicable, that:

- code is valid and runnable;
- the production build succeeds;
- affected pages render correctly;
- important interactions work;
- responsive behavior remains usable;
- the site remains compatible with its GitHub Pages deployment model.

All test source code belongs in the repository-root `tests/` directory rather
than in `src/`. Organize it by purpose as the project grows, using directories
such as `unit/`, `integration/`, `e2e/`, `fixtures/`, `snapshots/`, and
`artifacts/`.

Store ordinary test screenshots, failure screenshots, and debugging captures in
`tests/artifacts/YYYY-MM-DD-topic/`. These are temporary test evidence and must
be excluded from Git once the test environment is initialized.

Store image baselines in `tests/snapshots/` only when they are executable inputs
to an approved automated visual-regression test. Such baselines may be tracked by
Git because they are part of the test itself.

After acceptance, copy or export only representative screenshots required by
current implementation documentation to
`docs/documents/assets/YYYY-MM-DD-topic/`. Do not use temporary test artifacts as
permanent product documentation by default.

Never claim that work passes, renders correctly, deploys, or is complete without
fresh evidence. Report tests not run and the reason they were omitted.

## 13. Acceptance and records

Passing tests does not complete a requirement. The result remains awaiting user
acceptance until the user explicitly says it is accepted or gives an equally
clear confirmation.

Before acceptance:

- report implementation scope and verification evidence;
- provide relevant previews or screenshots;
- address requested revisions;
- do not create the final record or update current implementation documentation
  as though the work were accepted.

After acceptance:

- update affected `docs/documents/` current-state documentation;
- create the matching `docs/records/YYYY-MM-DD-topic.md` record;
- include the requirement, design, roadmap, test evidence, implementation
  differences, and relevant documentation links;
- remind the user to perform the appropriate Git update.

## 14. Git authorization

The assistant may perform read-only Git inspection, including status, diff,
branch, remote, and history checks.

Without an explicit Git instruction, do not:

- stage files;
- create commits;
- create, rename, delete, or merge branches;
- push or pull;
- rewrite or revert history;
- create tags or releases.

At useful milestones, proactively remind the user to update Git. State which
files should be included, summarize the intended change, and suggest a concise
commit message. The reminder is not permission to perform the operation.

## 15. Conflicts and exceptions

When a new request or chat instruction conflicts with this strategy, an approved
design, an approved roadmap, or current implementation documentation:

1. identify the conflict explicitly;
2. do not silently choose an interpretation;
3. ask the user whether the change is a one-time exception or a persistent rule;
4. record one-time exceptions in the matching historical record;
5. update this strategy or the appropriate design document when the user approves
   a permanent change;
6. update affected current implementation documentation after acceptance.

## 16. Completion checklist

Before presenting any requirement as complete, verify:

- the approved scope was implemented and no unauthorized scope was added;
- relevant tests were freshly executed and accurately reported;
- required visual evidence was provided;
- all confirmed chat decisions were written into project documentation;
- current-state documentation and the historical record were updated only after
  acceptance;
- environment or deployment documentation was updated when affected;
- Git status was reviewed and the user was reminded of an appropriate Git update;
- no unauthorized Git operation was performed.
