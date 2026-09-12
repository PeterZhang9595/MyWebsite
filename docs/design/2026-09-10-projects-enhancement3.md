# Projects 入口卡片放大与副标题（enhancement3）设计

## 文档状态

- 类型：设计文档（派生自 `docs/requirements/2026-09-10-projects-enhancement3.md`）
- 日期 / 主题：2026-09-10 / projects-enhancement3（与需求文件同名同日期）
- 状态：**草案，待用户批准**。批准前不进入实现。
- 修订：**2026-09-12 二稿**。用户追加「卡片图片区域调高」并**已选定封面比例 `5 / 4`**，见 §4.5。
- 关联文档：`docs/design/2026-09-09-projects-enhancement.md`（卡片原始刻画）、
  `docs/design/2026-09-10-projects-atmosphere-visibility.md`（角标移除）、
  `docs/documents/content-authoring.md` §7、`docs/documents/visual-and-interaction-system.md` §4。
- 测试文档：`docs/testing-strategies/2026-09-12-rich-content-rendering.md`（位置 × 内容类型测试矩阵）。

## 1. 需求原文

> 项目页 `_index` 主页面里面的各个子项目入口的矩形小窗口应该扩大一下（x1.5），
> 然后在主标题下面留出空位来写副标题介绍。

## 2. 澄清结论（2026-09-12 与用户确认）

| 决策点 | 结论 |
| --- | --- |
| 「×1.5」如何落地 | **每行 4 张 → 3 张**。精确 ×1.5 在 1440 视口下数学上不可达（见 §3.1），按「明显大一号」的意图落实 |
| 副标题内容来源 | **新增可选 `subtitle` 字段**；未填写时回退显示已有的必填 `description` |
| 封面区域高度 | **2026-09-12 追加**：用户要求把卡片图片区域调高。四档候选比例的实测已出（§4.5），**用户已选定 `5 / 4`** |
| 范围外 | 不改卡片 hover / 点击行为、不改「固定入口」胶囊区、不改分组标题 |

## 3. 现状实测（探针脚本读浏览器计算值，非推断）

容器宽度 = `.page-frame` 上限 1440px × `.content-page--wide` 的 80%
（`.site-shell` 提供 `clamp(1.25rem, 3.2vw, 3rem)` 内边距；≤560px 时 80% 变 92%）。

| 视口 | 容器实测宽 | 列数 | 单卡宽 × 高 |
| --- | --- | --- | --- |
| 390 | 322 | 1 | 322 × 214.7 |
| 1024 | 766.8 | 3 | 244.9 × 163.3 |
| 1280 | 958.5 | 3 | 308.8 × 205.9 |
| 1440 | 1078.3 | **4** | 257.6 × 171.7 |
| 1680 / 1920 | 1152（触顶） | 4 | 276 × 184 |

卡片固定 `aspect-ratio: 3 / 2`，网格 `gap: 1rem`。

### 3.1 为什么「×1.5」不能直接写出来

网格是 `repeat(auto-fill, minmax(240px, 1fr))`，**列数由容器宽度除以最小宽度取整决定**，
所以改最小宽度会让列数跳档，卡片宽度不是连续函数。

要在 1440 视口把 257.6px 放大到 1.5 倍（386.4px）：

- 3 列 × 386.4 = 1191.2px + 2×16 gap = 1223.2px 容器 —— 实测容器只有 1078.3px，放不下；
- 2 列 → 531.2px，是 ×2.06，又太大；
- 想加宽容器只能改 `.page-frame` 的 1440px 上限，而那是**全站共用**规则，牵动首页与所有栏目页。

结论：以「每行少一列」的方式落实 ×1.5 的意图，是唯一不牵动全站的路径。

### 3.2 顺带发现的既有缺陷

**1280 视口的卡片（308.8px）比 1440 视口的（257.6px）还大 20%**，因为 1440 处正好多塞进一列。
桌面段「视口越大、卡片越大」这个直觉在现状下不成立。本次一并修正。

## 4. 设计决策

### 4.1 网格：单值改动

```
/* src/styles/prose.css，第 9 行 */
- grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
+ grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
```

`min(100%, 300px)` 的 `min()` 是为窄屏兜底：避免在容器小于 300px 时出现横向溢出。

改后的实测预测（与 §3 同一套公式）：

| 视口 | 改前 | 改后 | 变化 |
| --- | --- | --- | --- |
| 390 | 1 列 × 322 | 1 列 × 322 | 不变 |
| 1024 | 3 列 × 244.9 | **2 列 × 375.4** | +53% |
| 1280 | 3 列 × 308.8 | 3 列 × 308.8 | 不变（本来就是 3 列） |
| 1440 | 4 列 × 257.6 | **3 列 × 348.8** | +35% |
| 1680 / 1920 | 4 列 × 276 | **3 列 × 373.3** | +35% |

**需要用户知情的副作用**：1024 视口会由 3 列变 2 列。这是无法避免的——
要让 1024 保持 3 列，最小宽度必须 ≤ 244.9px，那样 1440 仍是 4 列，需求就落不了地。
而 1024 下 244.9px 宽的卡片要塞进「标题 + 两行副标题」，底部信息条会吃掉卡片一半高度，
与需求目的（留出副标题空间）相冲突，所以选择让它变 2 列。

**已接受的残留现象**：1024–1244 档的单卡宽度（375.4）大于 1245–1300 档（约 335）。
离散列数的固有现象，单值改动无法消除；不引入媒体查询以保持回归范围最小。

### 4.2 副标题字段

```
/* src/lib/content-schema.ts，createProjectSchema */
subtitle: z.string().trim().optional(),
```

- 只加在 **project** schema 上，不进公共 schema（其它栏目没有这个位置）。
- 保持 `description` 必填不动——它仍承担页面头部说明与 SEO 描述。
- 回退逻辑写在组件里，只有一行，不额外抽模块：

```
/* src/components/content/ProjectCard.astro */
const subtitle = item.data.subtitle ?? item.data.description;
```

### 4.3 卡片结构

```
<a class:list={['project-card', !cover && 'project-card--bare']} href={href}>
  {cover && <Image class="project-card__cover" ... />}
  <div class="project-card__meta">
    <h3 class="project-card__title">{item.data.title}</h3>
    <p class="project-card__subtitle">{subtitle}</p>
  </div>
</a>
```

**注意这是一处结构变更**：为让标题与副标题共享同一块底部信息条，
把裸 `<h3>` 包进 `.project-card__meta`。`project-card__title` 的绝对定位随之上移到 `__meta`，
标题自身的定位规则改为静态。这会影响现有 `prose.css` 第 17 与 19 行两条规则，需要一并改写。

### 4.4 排版与截断

- `.project-card__title`：字号 `1.05rem` 与 `line-height: 1.35` 保持不变，仅从绝对定位改为静态。
- `.project-card__subtitle`：`font-size: .85rem`、`line-height: 1.4`、`color: var(--muted)`、
  `font-family: var(--ui)`（与站点「次要文字用无衬线」的既有约定一致）。
- **截断**：`description` 可能是长句，副标题固定截断为 **2 行**：
  `display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;`
- 底部信息条高度会从 54.7px 增至约 85px（1440 视口），约占卡片高度 33–37%。
  「封面因此被压得过狠」这一点已由用户于 2026-09-12 提出，转为 §4.5 单独决策。

### 4.5 封面区域高度（`aspect-ratio`）——2026-09-12 追加

**背景**：§4.4 原先把「封面被压得过狠」列为待观察项。用户于 2026-09-12 明确要求把图片区域调高。

**为什么不能只看 `aspect-ratio`**：`.project-card__meta` 是 `position: absolute` **覆盖**在封面之上的
半透明条，封面本身仍是 `inset: 0` 铺满整张卡。所以**真正能看到的图片区域 = 卡片高 − 信息条高**，
而信息条高度又随副标题是 1 行还是 2 行变化。判断「图片区域是否真的变大」必须以这个差值为准。

**实测**（1440 视口，卡片宽 348.8px，与 §4.1 改后一致；探针读浏览器计算值，非推断）：

| 封面比例 | 卡片高 | 卡片宽 | 信息条（1–2 行） | 可见封面高 | 相对现状 | 5 个项目网格总高（3 列 2 行） |
| --- | --- | --- | --- | --- | --- | --- |
| `3 / 2`（现状） | 232.5 | 348.8 | 68.3–87.3 | 145.2–164.2 | 基线 | 481 |
| `4 / 3` | 261.6 | 348.8 | 68.3–87.3 | 174.3–193.3 | +20.0% | 539.2 |
| **`5 / 4`（已选定）** | **279** | **348.8** | 68.3–87.3 | **191.7–210.7** | **+32.0%** | **574** |
| `1 / 1` | 348.8 | 348.8 | 68.3–87.3 | 261.5–280.5 | +80.1% | 713.6 |

单位 px。「相对现状」按 2 行副标题（信息条最厚、可见封面最少）这一最不利情形计算。

**实现只是一个值**：`src/styles/prose.css` 第 12 行 `aspect-ratio: 3 / 2` → **`aspect-ratio: 5 / 4`**。
列数由 §4.1 的 `minmax()` 决定，与卡片高度无关，所以两项改动互不干扰。

**已接受的连带影响**：

1. **`object-fit: cover` 开始裁切**。仓库现存唯一封面素材
   `src/assets/projects/large-platform.jpg` 是 1200 × 800，**正好 3 : 2**，现状下不裁切；
   改成 `5 / 4` 后会裁掉卡片左右两侧**约 17%**。真实封面素材需按 `5 / 4` 出图，或接受裁切。
2. **`.project-card--bare`（无封面卡）也会一起变高**。它共用同一个 `aspect-ratio`，
   无封面可看，只是占位变大（279px 高、内部仍只有居中标题）。若验收时观感不佳，
   再为该修饰符单独写一条比例规则，本次不引入。
3. **页面变长**：项目页 5 个条目在 3 列下占 2 行，网格总高由 481px 增至 574px（+19.3%）。

**已选定比例 `5 / 4`（2026-09-12 用户确认）**，可以进入实现。
预期效果预览（可交互）：`tests/artifacts/2026-09-12-rich-content-preview/preview.html`
的 S1 区块下半部分，四档并排、卡片宽度相同、标注实测值，`5 / 4` 那档带紫色外框与「已选定」标记。

## 5. 涉及文件

| 文件 | 改动 |
| --- | --- |
| `src/lib/content-schema.ts` | `createProjectSchema` 新增可选 `subtitle` |
| `src/components/content/ProjectCard.astro` | 引入 `.project-card__meta` 容器与副标题元素 |
| `src/styles/prose.css` | 第 9 行网格最小宽度；第 12 行 `aspect-ratio` 改为 `5 / 4`（§4.5）；第 17–19 行标题定位；新增副标题与 meta 规则；第 32 行窄屏规则同步 |
| `tests/unit/content-schema.test.ts` | `subtitle` 可选性用例 |
| `tests/e2e/projects.spec.ts` | 副标题渲染、回退行为、网格列数断言、卡片宽高比几何断言（§4.5） |
| `tests/fixtures/content/projects/**` | 补一个带 `subtitle` 的条目用于验证回退 |
| `docs/documents/content-authoring.md` | §7.1 字段表补 `subtitle` 与回退规则 |
| `docs/documents/visual-and-interaction-system.md` | 若该文档记录了项目网格尺寸，同步更新 |

## 6. 非目标

- 不引入媒体查询式的显式列数（保持单值改动，缩小回归面）。
- 不改 `.page-frame` 的 1440px 上限（全站共用，风险外溢）。
- 不给副标题加富文本 / 链接能力。
- 不改 `status`、`technologies`、卡片 hover / 点击行为。
- **不替换封面素材文件本身**（`src/assets/projects/*.jpg`）。
  注意：§4.5 会把 `aspect-ratio` 纳入改动范围，所以「不改封面图规格」这条已不成立，见 §4.5。

## 7. 验证方式

按 `docs/testing-strategies/2026-09-03-testing-strategy.md` 的风险分级：

1. **单元**：`subtitle` 可省略；填写时被 schema 接受；空串 / 纯空格按既有 `trim()` 约定拒绝。
2. **端到端（几何断言，关键）**：在 1440 与 1680 视口读取 `.project-grid` 的
   `getComputedStyle(...).gridTemplateColumns`，断言**恰好 3 条轨道**。
   只断言「副标题可见」抓不到列数没变这类缺陷，必须量几何。
3. **端到端（卡片比例几何断言，§4.5）**：读 `.project-card` 的 `getBoundingClientRect()`，
   断言 `width / height` ≈ **1.25**（`5 / 4`，容差 ±0.02）。**不能只断言「卡片变高了」**——
   改列数或改容器宽度都会让高度变化，而那是另一件事。同时断言
   **可见封面高（卡片高 − 信息条高）大于现状的 145.2px**，这才是用户真正要看的结果；
   实测预期为 **191.7–210.7px**（随副标题 1–2 行变化）。
4. **端到端（内容断言）**：
   - 有 `subtitle` 的条目，卡片显示 `subtitle` 原文；
   - 无 `subtitle` 的条目，卡片显示 `description` 原文（回退生效）；
   - 副标题被截断到 2 行（`scrollHeight > clientHeight` 的条目上断言行高 × 2）。
5. **回归**：完整 Chromium 端到端全量 + `astro check` + 生产构建。
6. **视觉证据**：1440 / 1680 两档截图归档到 `tests/artifacts/2026-09-10-projects-enhancement3/`，
   验收后把代表性截图移到 `docs/documents/assets/`。

## 8. 风险

| 风险 | 处置 |
| --- | --- |
| 包一层 `.project-card__meta` 改动现有绝对定位，可能破坏 `--bare` 卡片居中 | 保留 `--bare` 单独规则并加几何断言（标题仍在卡片垂直居中） |
| 1024 视口由 3 列变 2 列属计划外视觉变化 | 已在 §4.1 显式标注，验收时单独截图确认 |
| `description` 作为回退可能文案偏长、与页面头部重复 | 截断 2 行；若观感不佳，用户填写 `subtitle` 即可覆盖，不需要改代码 |
| 改 `aspect-ratio` 后 `object-fit: cover` 开始裁切现有 3:2 封面素材（§4.5） | 已量化：`5 / 4` 裁掉左右约 17%。真实封面素材按 `5 / 4` 出图，或接受裁切。**这是素材约定问题，实现侧无法消除** |
| `.project-card--bare` 随 `aspect-ratio` 一起变高，导致无封面卡出现大面积空白 | 已在 §4.5 标注；若验收时观感不佳，再为该修饰符单独写一条比例规则（属追加改动，需重新确认） |
| 卡片变高使项目页变长（`5 / 4` 时网格总高 +19.3%） | 已在 §4.5 给出各档网格总高；`5 / 4` 的 574px 为用户在四档中权衡后的选择 |
