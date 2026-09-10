# Superpowers 工程方法论长期兼容

- 日期：2026-09-07
- 类型：治理与文档变更（无应用代码、依赖、构建或部署改动）
- 决策来源：用户在聊天中明确选择「长期兼容 superpowers」，属于永久规则变更而非一次性例外
- 相关文档：
  - [开发策略第 16 节](../development/strategy.md)
  - [测试策略](../testing-strategies/2026-09-03-testing-strategy.md)
  - [仓库根 AGENTS.md](../../AGENTS.md)

## 背景

用户要求从 WorkBuddy 推荐市场安装 `superpowers` 与 `frontend-design` 两个用户级技能。安装后发现 `superpowers`
的方法论与本仓库既定规则存在三处直接冲突，按开发策略第 15 节提出并由用户裁决。

| 冲突点 | Superpowers 默认要求 | 本仓库原规则 |
| --- | --- | --- |
| Git | 自动创建分支与 git worktree | 未经用户明确指令禁止任何 Git 变更 |
| 写代码 | 强制先写会失败的测试，测试前写的代码一律删除 | 必须拿到「批准实现」级别授权才动代码 |
| 需求 | 头脑风暴阶段可自由改写规格 | `docs/requirements/` 为只读 |

## 决策

用户选择**长期兼容**，即把 superpowers 纳入项目永久工作流，同时保留本仓库的授权与治理边界。

## 实际变更

1. `docs/development/strategy.md`
   - 新增第 16 节「Superpowers 工程方法论兼容规则」，含优先级、步骤映射与授权门、Git 工作区、
     TDD、子代理与评审、收尾、不可让渡边界共 7 小节。
   - 原第 16 节「Completion checklist」顺延为第 17 节，并新增一条 superpowers 合规检查项。
   - 第 6 节补充说明：进入 superpowers 任一步骤或完成其头脑风暴、计划步骤，均不自动构成实现授权。
2. `docs/testing-strategies/2026-09-03-testing-strategy.md`
   - Level 1 补充：superpowers 生效且已获实现授权时，测试优先从「可选」变为「默认」；
     标记、文案、内容类任务仍然豁免；测试代码仍只放仓库根 `tests/`。
3. `AGENTS.md`
   - 新增一条规则，指向开发策略第 16 节，并声明项目文档在冲突时优先。

## 未变更的部分

- `docs/requirements/` 仍然只读。
- Git 授权、依赖与部署授权、验收后更新文档与建记录的流程均保持不变。
- 未新增依赖，未改动 `package.json`、`astro.config.mjs`、应用代码或部署配置。

## 验证

本次为文档级（Level 0）变更，未运行网站构建或浏览器测试。已确认：

- 三个被修改文件的相对链接均指向存在的文件；
- 新增章节编号连续（15 → 16 → 17），无重复或断号；
- 工作树除上述文档外无其他改动。

## 已知偏差

- 第 16 节按开发策略第 9.1 节以简体中文撰写，而 `strategy.md` 其余部分为英文历史内容，
  因此该文件当前为混合语言。用户若要求，可将全文统一译为简体中文。
- 本次决策源于聊天，用户尚未在 `docs/requirements/` 中补写对应需求文件。该目录为只读，
  是否补写由用户决定。

## 同日后续补充

1. **语言问题**：用户明确决定保留 `strategy.md` 的英文主体与中文第 16 节，不翻译全文。
   因此该文件的混合语言状态是已知且被接受的，不是待办项。
2. **`.gitignore`**：用户明确授权将 `.workbuddy/` 加入忽略列表，已完成。该目录保存助手的项目记忆，
   不进入版本历史。至此本次治理变更涉及的文件为：

```text
.gitignore
AGENTS.md
docs/development/strategy.md
docs/testing-strategies/2026-09-03-testing-strategy.md
docs/records/2026-09-07-superpowers-compatibility.md
```

## Git 提醒

建议将以下文件纳入一次提交：

```text
.gitignore
AGENTS.md
docs/development/strategy.md
docs/testing-strategies/2026-09-03-testing-strategy.md
docs/records/2026-09-07-superpowers-compatibility.md
```

建议提交信息：`docs: adopt Superpowers methodology with project authorization constraints`
