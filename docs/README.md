# Project Documentation

This directory is the durable knowledge base for the personal website. Chat
history is not a substitute for these documents. Requirements, confirmed design
choices, implementation plans, current behavior, test policy, deployment
knowledge, environment requirements, and historical changes are maintained here.

The repository root `README.md` introduces the website project to visitors and
developers. This file documents the internal documentation system.

## Primary instruction documents

- [Development strategy](development/strategy.md): persistent project workflow,
  authorization boundaries, documentation rules, acceptance, and Git policy.
- [Testing strategy](testing-strategies/2026-09-03-testing-strategy.md): active
  risk-based testing and verification rules.
- The repository root [`AGENTS.md`](../AGENTS.md) automatically directs coding
  agents to these policies.

## 当前网站实现文档

- [网站架构与维护接口](documents/website-architecture.md)：路由、布局、内容仓库、日期、URL、搜索、构建和部署边界。
- [内容创作与维护指南](documents/content-authoring.md)：Bio、Notes、Tips、Projects、Interests、本地数据和 Markdown 模板。
- [视觉与交互系统](documents/visual-and-interaction-system.md)：设计变量、响应式布局、终端路径、主题、搜索和媒体扩展接口。
- [网站基础版本实现记录](records/2026-09-03-website-setup.md)：本次验收结果、技术选择、测试、偏差、临时文字和 Git 状态。
- [GitHub Pages 部署说明](deployment/2026-09-03-github-pages.md)：首次设置、部署过程和排障方式。

## Documentation lifecycle

```text
User requirement
      ↓
Clarification and confirmed chat decisions
      ↓
Design documents and implementation roadmap
      ↓
User approval and explicit implementation authorization
      ↓
Implementation and risk-based testing
      ↓
Delivery for user acceptance
      ↓
Current implementation documentation and historical record
      ↓
Git update reminder
```

Passing tests does not equal user acceptance. Final implementation documentation
and historical records are updated only after explicit acceptance.

## Directory guide

| Directory | Purpose |
| --- | --- |
| `deployment/` | GitHub Pages requirements, deployment procedures, troubleshooting, and operational guidance. Executable deployment changes require explicit authorization. |
| `design/` | Approved design specifications organized by design object, including typography, color, layout, imagery, motion, responsive behavior, and interaction. |
| `documents/` | Current-state technical documentation explaining how the implemented website works, where it can be modified, its dependencies, and its final behavior. |
| `development/` | Persistent development governance. Currently maintains the single `strategy.md`. |
| `requirements/` | Original user-authored requirements and ideas. Read-only to the assistant unless a specific edit is explicitly authorized. |
| `records/` | Historical record for every accepted requirement that changed the repository, including documentation-only changes. |
| `implement-roadmap/` | Requirement-specific implementation approaches and plans prepared before coding. Omission requires explicit user approval. |
| `testing-strategies/` | Active testing policy and future test-specific guidance. |
| `env-list/` | Current reproducible environment requirements, maintained in [`environment.md`](env-list/environment.md). Never stores secrets. |

## File naming

New requirement, implementation roadmap, and historical record files use:

```text
YYYY-MM-DD-topic.md
```

Documents derived from the same requirement reuse the same date and topic when
their relationship is one-to-one:

```text
requirements/2026-09-03-example.md
implement-roadmap/2026-09-03-example.md
records/2026-09-03-example.md
```

Use lowercase English topic slugs separated by hyphens. Use relative Markdown
links to connect related documents. Historical files created before this rule may
remain unchanged unless the user explicitly requests a rename.

Design and current implementation documents may use stable subject names instead
of requirement names when they describe a long-lived part of the website.

## Writing responsibilities

- The user authors the original files in `requirements/`.
- The assistant identifies ambiguities, presents options, and converts confirmed
  decisions into the appropriate derived documents.
- Confirmed chat decisions must be synchronized before the current task ends.
- The assistant maintains current implementation, environment, testing, and
  deployment documentation when affected by approved work.
- The assistant must not treat an unapproved proposal as a project decision.
- 助手新生成的文档统一使用简体中文。命令、路径、标识符、包名、URL 和专有名词为了技术准确性可以保留原文。现有英文历史文件继续有效，除非用户明确要求翻译。

## Screenshots

All test source code belongs in the repository-root `tests/` directory. Its
intended structure is:

```text
tests/
├─ unit/           focused unit tests
├─ integration/    tests across project units
├─ e2e/            browser and user-flow tests
├─ fixtures/       stable test inputs
├─ snapshots/      tracked baselines used by automated visual tests
└─ artifacts/      temporary screenshots and debugging output
```

Store ordinary rendering screenshots, failure screenshots, and debugging
captures under `tests/artifacts/YYYY-MM-DD-topic/`. The directory must be ignored
by Git when the test environment is initialized.

Only baselines that are actively used by an approved automated visual-regression
test belong in `tests/snapshots/` and may be committed.

After user acceptance, copy or export only representative final screenshots
needed by current implementation documentation to:

```text
documents/assets/YYYY-MM-DD-topic/
```

Current implementation documents should reference these screenshots with relative
paths. Replace or update them when the documented visual result changes. Do not
promote all test artifacts into permanent documentation.

## Git policy

Documentation changes do not authorize Git mutations. The assistant may inspect
Git and recommend an update, but staging, committing, branching, merging, pushing,
pulling, reverting, tagging, and releasing require an explicit user instruction.
