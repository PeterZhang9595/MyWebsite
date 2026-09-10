# 2026-09-10 Interests 卡牌化实施路线图

对应设计：[`docs/design/2026-09-10-interests-card-wall.md`](../design/2026-09-10-interests-card-wall.md)
对应需求：[`docs/requirements/2026-09-09-interests-enhancement.md`](../requirements/2026-09-09-interests-enhancement.md)

> 状态：**已实现并验证**（阶段 0–4 全部完成；Chromium E2E 18 例全绿，构建 46 页，截图 8 张）。
> 实施记录：[`docs/records/2026-09-10-interests-card-wall.md`](../records/2026-09-10-interests-card-wall.md)

---

## 完成情况

| 阶段 | 状态 |
|---|---|
| 阶段 0 准备 | ✅ 用户已批准（「批准实现，请尽可能保证前端设计的美观」） |
| 阶段 1 内容模型与工具 | ✅ |
| 阶段 2 路由改造 | ✅ |
| 阶段 3 组件实现 | ✅ |
| 阶段 4 测试与验收 | ✅ T4.1–T4.5 全部完成（截图 8 张） |

### 与原始规划的偏差

| 规划 | 实际 | 原因 |
|---|---|---|
| T3.2 单独建 `HeroPair.astro` | ❌ 未建 | `InterestsHome` 内直接用 CSS Grid + `FlipCard variant="hero"` 组装即可，独立组件无附加价值（避免空壳组件） |
| T3.1 `FlipCard` 承载三段式逻辑 | 结构在组件、**交互在 `public/scripts/interests.js`** | 三段式需要浮层（跨页面单例），放组件内会重复绑定；抽出为独立脚本更简洁 |
| 规划未含的多语言脚本标签 | ✅ 追加 `data-labels` 机制 | 浮层文案需双语；避免脚本内硬编码中文 |
| 规划未含的 `alt` 字段 | ✅ 追加 schema 可选 `alt` | 原设计 §7.4 待定项，本轮采纳 |
| fixture 仅规划「补类别与卡片」 | ✅ 扩为 **6 类别 × 双语 = 12 个** fixture 页 | E2E 需断言滑轨的 6 类与顺序；只建 1 类无法覆盖 |
| 截图脚本 | ✅ 归档到 `scripts/capture-interests.mjs`（非产物目录） | 它是工具而非证据，与 `playwright-site.mjs` 同处 |

---

## 阶段划分

### 阶段 0：准备（无代码改动）

| # | 任务 | 产出 |
|---|---|---|
| T0.1 | 用户审阅设计文档并「批准实现」 | 授权记录 |
| T0.2 | 确认图片路径约定与 Hero 图比例 | 若无异议按设计 §7.3 / §7.4 执行 |

### 阶段 1：内容模型与工具（可单测，先做）

| # | 任务 | 文件 | 验收 |
|---|---|---|---|
| T1.1 | 扩展 interests schema：`heroImages` / `cards` | `src/lib/content-schema.ts` | `astro check` 通过；现有占位内容不报错 |
| T1.2 | 新建帧色调色板与取值函数 | `src/lib/interests-frames.ts` | `frameFor` 越界循环、hex 合法 |
| T1.3 | 帧色单测（TDD：先写测试） | `tests/unit/interests-frames.test.ts` | 全绿 |
| T1.4 | schema 单测补充（heroImages/cards 校验） | `tests/unit/content-schema.test.ts` | 全绿 |

**验收**：`astro check` 0 错误；`vitest` 全绿。

### 阶段 2：路由改造

| # | 任务 | 文件 | 验收 |
|---|---|---|---|
| T2.1 | 新增 zh catch-all 路由 | `src/pages/interests/[...slug].astro` | `/interests/sports/` 可访问 |
| T2.2 | 新增 en catch-all 路由 | `src/pages/en/interests/[...slug].astro` | `/en/interests/sports/` 可访问 |
| T2.3 | 调整两个 index 路由指向新主页组件 | `src/pages/{,en/}interests/index.astro` | 主页正常渲染 |
| T2.4 | 内容文件落地：6 类别 × 2 语言 | `src/content/interests/{zh,en}/*` | 12 个 `_index.md` + 主页 `_index.md` |
| T2.5 | fixture 同步 | `tests/fixtures/content/interests/{zh,en}/*` | E2E 有稳定断言目标 |

**验收**：12 个类别页 + 2 个主页均能构建出静态页。

### 阶段 3：组件实现

| # | 任务 | 文件 | 说明 |
|---|---|---|---|
| T3.1 | 通用翻面卡牌（放大→翻面→复原） | `src/components/content/FlipCard.astro` | 三段式 + 键盘 + `Esc` |
| T3.2 | 主页双图 | `src/components/content/HeroPair.astro` | 等宽平分，复用 FlipCard 交互 |
| T3.3 | 主页横滑轨道 | `src/components/content/CardRail.astro` | 拖拽 + 滚轮，零依赖 |
| T3.4 | 主页组件 | `src/components/pages/InterestsHome.astro` | 组装 T3.2 + T3.3 |
| T3.5 | 子页组件 | `src/components/pages/InterestsCategoryPage.astro` | 渐变背景 + 卡牌墙 + 聚焦灰化 |
| T3.6 | 样式 | `src/styles/interests.css` | 渐变（浅/深）、卡牌、轨道、reduced-motion |

**验收**：视觉与原型一致；reduced-motion / 触屏 / 键盘三条无障碍路径可用。

### 阶段 4：测试与验收

| # | 任务 | 文件 |
|---|---|---|
| T4.1 | E2E：主页交互（放大/翻面/复原、滑轨滚动、六卡可点入） | `tests/e2e/interests.spec.ts` |
| T4.2 | E2E：子页交互（卡牌数、帧色、hover 灰化、三段式、Esc） | 同上 |
| T4.3 | E2E：双语可访问性 | 同上 |
| T4.4 | 截图：主页 + 子页 × 浅/深主题 | `tests/artifacts/2026-09-10-interests/` |
| T4.5 | 记录文档 | `docs/records/2026-09-10-interests-card-wall.md` |

---

## 风险与对策

| 风险 | 对策 |
|---|---|
| 新增 catch-all 会改变 URL 结构 | 设计中已显式列出，批准范围内一并授权；旧的单页 URL 保持有效（`/interests/` 仍是主页） |
| 图片未到位导致视觉判断失真 | 先用占位图搭原型；用户补图后重跑截图验收 |
| 渐变在暗色主题下可读性 | 已定深底版本（设计 §7.2），构建后双主题截图验证 |
| 300+ 卡片时的性能 | 构建期静态渲染、零运行时 JS；动画只用 transform/opacity |

---

## 不在本次范围

- 不新增 npm 依赖、不引入前端框架。
- 不改动 notes / tips / projects 板块。
- 不做卡片的后台编辑工具（属另一份需求 `2026-09-03-edit-tools-development.md`）。
