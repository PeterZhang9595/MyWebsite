# 2026-09-10 Projects 散点氛围层迭代 实施路线图

对应设计：[`2026-09-10-projects-atmosphere-visibility.md`](../design/2026-09-10-projects-atmosphere-visibility.md)
对应记录：[`2026-09-10-projects-atmosphere-visibility.md`](../records/2026-09-10-projects-atmosphere-visibility.md)

本轮为**二轮视觉增强（09-09）之后的散点氛围层专项迭代**，由聊天驱动、分多次小步推进（设计文档 §1–§16）。
每一轮均遵循项目规矩：聊天确认的决策先落到设计文档，实现阶段 TDD，未获明确授权不动代码。

## 总览

| 阶段 | 主题 | 对应设计节 | 状态 |
|---|---|---|---|
| T1 | 散点采样抽为纯函数模块 + 可见度调整 | §1–§7 | ✅ |
| T2 | 密度 60 → 300 + 卡片实色遮罩 | §8 | ✅ |
| T3 | 密度 300 → 500 + 卡片半透明化 | §9 | ✅ |
| T4 | 移除卡片状态角标 | §10 | ✅ |
| T5 | 卡片内点强度 50% + 密度 900 | §11 | ✅ |
| T6 | 密度 900 → 1500 | §12 | ✅ |
| T7 | 卡片 B 档通透 + 底栏分界线 | §13 | ✅ |
| T8 | 散点改为全视口固定背景 | §14 | ✅ |
| T9 | 提高浮动幅度 | §15 | ✅ |
| T10 | 加深 muted 文字 + projects 页正文专用色 | §16 | ✅ |

## T1 散点采样抽为纯函数模块（§1–§7）

**背景**：初版散点 LCG 采样内联在 `ProjectAtmosphere.astro` frontmatter 中，无法被单测覆盖；且参数过淡（size 1–3px、opacity 0.05–0.13）在浅色背景下几乎不可见。

1. **新建** `src/lib/atmosphere-dots.ts`：导出 `Dot` 接口与 `makeDots(count, seed = 20260910)`，内含 LCG、`lerp`、`round1` / `round2`。头部注释记录参数来源与数量演变。
2. **改** `ProjectAtmosphere.astro`：删除内联 LCG，改为 `import { makeDots }`，调用 `makeDots(60)`。
3. **改** `prose.css`：`.project-atmosphere__dot` 尺寸/透明度区间随采样上调。
4. **新建** `tests/unit/atmosphere-dots.test.ts`（RED 先行）：覆盖区间、确定性、精度、组件硬编码防回退断言。

**验证**：`astro check` 0 errors；`vitest` 全绿。

## T2 密度 60 → 300 + 卡片实色遮罩（§8）

1. `ProjectAtmosphere.astro`：`makeDots(60)` → `makeDots(300)`。
2. `prose.css`：`.project-card` 背景 `transparent` → `var(--surface)`（让点不透过卡片漏出，保证前景干净）。
3. 单测同步数量断言。

**验证**：`vitest` 8 例全绿。

## T3 密度 300 → 500 + 卡片半透明化（§9）

**背景**：用户修正"子项目入口"指的是 `/projects/` 目录页的**卡片**；要求卡片半透明让点透进来，且卡片内点比卡片外更浅。

1. `ProjectAtmosphere.astro`：`makeDots(300)` → `makeDots(500)`。
2. `prose.css`：
   - `.project-card` 背景 `var(--surface)` → `color-mix(in srgb, var(--bg) 78%, transparent)`；
   - `.project-card__cover` 加 `opacity: .9`；
   - `.project-card__title` 压暗条 `88%` → `72%`。
3. 单测同步。

**验证**：`astro check` 0 errors；`vitest` 18 文件 60 测试全绿。

## T4 移除卡片状态角标（§10）

**背景**：用户认为卡片左上角 8px 状态圆点"太丑"。

1. `ProjectCard.astro`：删除 `.project-status` 元素与 `status` / `hasStatus` 变量。
2. `prose.css`：删除 `.project-status` 及三条 `--active/--completed/--archived` 规则。
3. `tests/e2e/projects.spec.ts`：原「角标数量 + 颜色」断言改为**反向断言**（数量为 0）。
4. **保留**详情页 `.project-status-line` / `.status-ripple` 波纹灯与 `--status-*` 令牌（状态信息在详情页仍有呈现）。

**验证**：`astro check`、`vitest` 全绿。

## T5 卡片内点强度 50% + 密度 900（§11）

1. `prose.css`：`.project-card` 背景 `78%` → `50%`（透出点强度 22% → 50%）。
2. `ProjectAtmosphere.astro`：`makeDots(500)` → `makeDots(900)`。
3. 单测同步 + 组件硬编码防回退断言更新为 900。

**验证**：`astro check`、`vitest` 全绿。

## T6 密度 900 → 1500（§12）

1. `ProjectAtmosphere.astro`：`makeDots(900)` → `makeDots(1500)`。
2. 单测同步 1500；`atmosphere-dots.ts` 注释数量演变补到 1500。
3. 设计文档 §12 记录用户截图"卡片不透明"实为**旧 dist**（§11 改动未构建），非源码问题。

**验证**：`astro check`、`vitest` 全绿。

## T7 卡片 B 档通透 + 底栏分界线（§13）

**背景**：用户从四档对照中选择 B 档（整体通透），并明确要求**保留底栏与图片间的分界线**。

1. `prose.css`：
   - `.project-card` 背景 `50%` → `25%`；
   - `.project-card__title` 背景 `72%` → `35%`，**新增** `border-top: 1px solid var(--divider)`；
   - `.project-card--bare .project-card__title` 显式 `border-top: 0`。
2. 点透出强度 ≈ 91%。

**验证**：`astro check`、`vitest` 全绿。

## T8 散点改为全视口固定背景（§14）

**背景**：用户要求散点分布到**整个界面**（此前只在内容列内）。

1. `prose.css`：`.project-atmosphere` `position: absolute` → `position: fixed; inset: 0; z-index: 0`。
2. `global.css`：`.site-shell` 加 `position: relative; z-index: 1`（把全站内容抬到散点层之上）。
3. **关键约束**：散点层不可用负 z-index（会被不透明的 `body` 背景 `var(--bg)` 盖住）。

**验证**：`astro check`、`vitest` 全绿；E2E 既有可见性断言继续成立。

## T9 提高浮动幅度（§15）

1. `prose.css` `@keyframes dot-float`：`translateY(-6px)` → `translate3d(-5px, 0, 0)` → `translate3d(5px, -14px, 0)`（加水平漂移，避免机械往复）。
2. 用 `translate3d` 触发 GPU 合成（1500 点性能）。
3. **约束**：`animation-direction: alternate` 必须配**两段**关键帧（from/to），三段会导致去程回程不对称。

**验证**：`astro check`、`vitest` 全绿。

## T10 加深 muted 文字 + projects 页正文专用色（§16）

**背景**：projects 页灰色文字在点云背景下与点视觉混淆（点用 `var(--text)`，与原 `--muted` 颜色区间太近）。

1. `tokens.css`：全局 `--muted` 浅色 `#676767` → **`#2a2a2a`**，深色 `#aaa59e` → **`#d6d1c8`**。
2. `prose.css`：`.project-section` 内 `.content-header h1` / `.content-description` / `.prose` 用 `var(--text)`；行内代码浅 `#1a1a1a` / 深 `#f4f1eb`。

**验证**：`astro check`、`vitest` 全绿。

## 授权与 Git

本轮为**聊天驱动的迭代实现**，每次改动前均取得用户明确授权（"批准实现""直接改，事后补记录"）。
仅 `docs/requirements/` 不触碰。所有 git 变更保持未提交，收尾时给用户提交建议，不自行 commit。
