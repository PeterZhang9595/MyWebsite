# 2026-09-12 移除音乐播放器 实施记录

来源需求：[`docs/requirements/2026-09-03-website-setup.md`](../requirements/2026-09-03-website-setup.md)（第 50 行“右下角可收缩音乐播放器”）
对应设计：无（本次为移除，未新建设计文档）
对应路线图：无（改动范围小，未单独建立路线图）
相关现状文档：[`docs/documents/visual-and-interaction-system.md`](../documents/visual-and-interaction-system.md)、[`docs/documents/website-architecture.md`](../documents/website-architecture.md)、[`docs/documents/content-authoring.md`](../documents/content-authoring.md)

> 本记录在用户明确要求“不做音乐播放器了，把它从前端页面删掉吧”，并在范围确认中选择“蓝框 + 灰框全清”后开始执行。

## 背景

音乐播放器自首版起只有外壳：`MusicPlayerShell.astro` 共 9 行，无 `<audio>`、无任何 JavaScript，永远渲染 `playlistPending` 兜底文案；`src/data/music.json` 是空数组，`public/media/audio/` 只有一个 `.gitkeep`。它既未落地原始需求里的“右下角可收缩”形态，也从未真正播放过任何音频。

用户决定不再推进该功能，并要求删除。约束是“必须保证不对其它已有内容产生影响”。

## 范围确认

用户在两轮确认后选择**连同数据层一起清理**：

| # | 决策点 | 选定 |
|---|---|---|
| 1 | 删除范围 | **前端可见层 + 数据层全清**（不留死代码） |
| 2 | 数据接口 | **删除** `music.json` / `musicSchema` / `loadMusic()` / `public/media/audio/`，并删除对应单元测试 |

明确保留、不触碰的内容：

- `src/data/recent-focus.json`、`src/data/quotes.json` 及其数据接口；
- `src/components/media/QuoteRotator.astro`、`IllustrationMedia.astro` 与右栏容器 `PersonalMedia.astro`；
- 兴趣栏目下的**「音乐」分类页**（`src/content/interests/{zh,en}/music/_index.md`），它与播放器无关，属于内容；
- `docs/requirements/` 全部文件（用户所有，只读），其中“右下角可收缩播放器”一条原样保留。

## 变更清单

### 代码与配置（7）

| 文件 | 操作 | 说明 |
|---|---|---|
| `src/components/media/MusicPlayerShell.astro` | **删除** | 播放器外壳组件本体 |
| `src/components/media/PersonalMedia.astro` | 改 | 移除组件 import 与 `<MusicPlayerShell {lang}/>`；右栏保留随机句子与插画两件 |
| `src/lib/local-data.ts` | 改 | 删除 `musicData` import、`musicSchema` 导出与 `loadMusic()`；注释同步为“校验两个 JSON 文件” |
| `src/i18n/ui.ts` | 改 | `UiKey` 联合类型与 zh / en 两处词典删除 `playlistPending` |
| `src/styles/global.css` | 改 | 删除 `.player`、`.player__disc` 两条规则，以及 `560px` 媒体查询中的 `.player { width: 92%; }` |
| `src/data/music.json` | **删除** | 空数组数据文件 |
| `public/media/audio/` | **删除** | 连同 `.gitkeep` 一并移除；目录为空，git 本就不跟踪空目录 |

### 测试（3）

| 文件 | 操作 | 说明 |
|---|---|---|
| `tests/e2e/media-shell.spec.ts` | 改 | 删除 `getByRole('button',{name:'Play'})` 禁用断言；用例句名从“句子在标签页中保持且播放器空状态禁用”改为“句子在标签页中保持且不加载视频” |
| `tests/e2e/homepage.spec.ts` | 改 | 删除 `getByText('播放列表待添加')` 可见性断言 |
| `tests/unit/content-schema.test.ts` | 改 | 移除 `musicSchema` import、空数组断言与 `requires provenance for future music` 用例 |

> `tests/fixtures/content/interests/*/music/_index.md` 属于兴趣分类 fixture，未改动。

### 文档（4）

| 文件 | 操作 | 说明 |
|---|---|---|
| `docs/documents/visual-and-interaction-system.md` | 改 | 第 13 节由“播放器扩展接口”改为“音乐播放器（已移除）”；第 3 节 `--ui` 职责去掉“播放器”，改为“工具栏”；第 4 节 `560px` 断点去掉播放器宽度；文档状态增加变更日期；第 1 节补充说明现有截图拍摄于移除之前；第 12 节补充 `PersonalMedia` 组合说明 |
| `docs/documents/website-architecture.md` | 改 | 第 9 节由“三个 JSON 文件”改为两个，删除 `music.json` 条目与音频目录说明 |
| `docs/documents/content-authoring.md` | 改 | 第 14 节由“音乐数据”改为“音乐数据（已移除）”，删除曲目 JSON 结构示例 |
| `docs/records/2026-09-12-remove-music-player.md` | **新建** | 本记录 |

## 验证证据

测试级别：**Level 2（页面与样式变更）**，并补充了全量浏览器回归以支撑“不影响其它内容”的要求。

| # | 检查 | 命令 | 结果 |
|---|---|---|---|
| 1 | 残留引用扫描 | 全仓库检索 `MusicPlayerShell` / `loadMusic` / `musicSchema` / `music.json` / `playlistPending` / `media/audio` / `.player` 与用户可见文案 `播放列表` / `Playlist` | **通过**：代码、测试、配置零残留 |
| 2 | 单元与集成测试 | `node node_modules/vitest/vitest.mjs run` | **94/95 通过**；唯一失败为 `tests/integration/git-dates.test.ts` 超时，见“已知环境问题” |
| 3 | 该失败项复跑 | 同上，`--testTimeout=60000` | **通过**，耗时 5204ms |
| 4 | Astro / TypeScript 检查 | `node node_modules/astro/bin/astro.mjs check` | **通过**：123 文件，0 error / 0 warning / 0 hint |
| 5 | 生产构建 | `node node_modules/astro/bin/astro.mjs build` | **39 个页面全部生成**，产物中检索 `player` / `播放列表` / `Playlist` 零命中 |
| 6 | 端到端浏览器回归 | `node scripts/run-playwright.mjs --project=chromium` | **首轮 82/83**，失败项为 `homepage.spec.ts` 的播放器文案断言（本清单已补漏）；修复后**复跑 83/83 通过** |
| 7 | 视觉核对 | 桌面 1440×1000 与移动 390×844 主页全页截图 | **通过**：右栏只剩随机句子与插画占位，左栏资料区、Bio、Recent Focus/Tips、三个栏目入口与版权全部正常，移动端维持单栏且无横向溢出 |

截图存于 `tests/artifacts/2026-09-12-remove-music-player/`（临时产物，已 gitignore）：`homepage-light-desktop.png`、`homepage-light-mobile.png`、`homepage-dark-desktop.png`。

无障碍未被削弱：`tests/e2e/accessibility.spec.ts` 的 axe 三项（`/`、`/notes/`、`/notes/cs285/policy-gradient/`）全部通过。

## 过程中的一处疏漏（已修正）

首轮端到端回归失败，原因是 `tests/e2e/homepage.spec.ts` 断言了播放器的**中文界面文案**「播放列表待添加」。事前检索只覆盖了 `player` / `播放器` / `playlistPending` 这类标识符，没有覆盖用户可见字符串，因此漏掉了这一处。第二处同类断言在 `media-shell.spec.ts`（按钮无障碍名 `Play`）已被检索到并提前处理。

教训：删除界面元素时，检索必须同时覆盖**标识符**和**用户可见文案**。

## 已知环境问题（与本次改动无关）

- `tests/integration/git-dates.test.ts` 在本机耗时约 5204ms，超出 Vitest 默认 5000ms 超时约 200ms。加长超时后通过，判定为本机 Windows 进程启动开销导致的临界超时，非本次改动引起。**建议**：为该用例单独设置 `testTimeout`，否则该测试在本机将持续不稳定。
- 本轮只运行了 Chromium。本机仅安装 Chromium，`test:e2e:webkit` 与 `test:e2e:firefox` 未执行（Firefox 在本机已知报 `spawn UNKNOWN`）。
- 本次会话的 Git Bash 环境 PATH 异常（`ls`、`dirname`、`tail` 等 coreutils 不可用），PowerShell 工具不返回标准输出；文件删除与产物清理改用 Node `fs` API 完成。这是会话环境问题，不影响仓库本身。

## 残留风险与待确认

- `docs/requirements/2026-09-03-website-setup.md` 第 50 行仍要求“右下角可收缩音乐播放器”。该文件归用户所有，本次未改写。需求与实现的这一差异已在 `visual-and-interaction-system.md` 第 13 节记录。若用户希望正式关闭该需求，需要自行在需求文档中标注，或授权助手修改。
- `docs/design/2026-09-03-website-setup.md`、`docs/implement-roadmap/2026-09-03-website-setup.md`、`docs/records/2026-09-03-website-setup.md` 是带日期的历史记录，其中关于播放器的描述**有意保留原样**，不改写历史。阅读时以本记录和现状文档为准。
- 恢复播放器需要重新建立 schema、数据文件、组件与浏览器测试，不能假定旧接口可用。

## Git

本次未执行任何 Git 操作。改动为删除 3 个文件、修改 8 个文件、新建 1 个文档；`dist/`、`.astro/`、`tests/artifacts/` 均为 gitignore 内产物，不进入版本历史。建议用户自行审阅 `git status` / `git diff` 后决定提交。
