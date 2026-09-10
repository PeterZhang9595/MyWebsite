/**
 * 让 Astro 的预渲染中间目录可以重定向到系统临时目录。
 *
 * 背景：`astro/dist/prerender/utils.js` 通过 `getOutDirWithinCwd(outDir)`
 * 计算 `./.prerender/` 的父目录，而 `getOutDirWithinCwd` 在 outDir 位于
 * cwd 之外时会回退到 `<cwd>/.astro/`。本机安全策略只允许对系统临时目录
 * 执行 trash，工作区内的路径会被拒绝，于是构建收尾那次
 * `fs.promises.rm(prerenderOutputDir)` 必然中断整个构建。
 *
 * 早前试过把构建 cwd 切到临时目录来绕开，但那样 `import("sharp")`
 * 会以临时目录为基准解析，直接报 MissingSharp —— 所以 cwd 必须留在仓库，
 * 只能改预渲染目录本身。
 *
 * 补丁内容：优先读取环境变量 `ASTRO_PRERENDER_DIR`，设置时以它作为
 * 预渲染目录的父级。幂等，重复执行不会叠加。
 *
 * 这是对 node_modules 的改动，pnpm 重装依赖后会失效，
 * 届时重新执行本脚本即可（scripts/playwright-site.mjs 的注释里也有提示）。
 *
 * 用法：node scripts/patch-astro-prerender-dir.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);

const MARKER = 'ASTRO_PRERENDER_DIR';

/** 定位真实文件：pnpm 下 require.resolve 可能只拿到软链入口，这里逐个兜底。 */
function locateUtils() {
  const attempts = [];
  try {
    attempts.push(require.resolve('astro/dist/prerender/utils.js'));
  } catch {
    /* 继续尝试 */
  }
  try {
    attempts.push(resolve(dirname(require.resolve('astro/package.json')), 'dist/prerender/utils.js'));
  } catch {
    /* 继续尝试 */
  }
  attempts.push(resolve('node_modules/astro/dist/prerender/utils.js'));
  return attempts.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

const utilsPath = locateUtils();
if (!utilsPath) {
  console.error('[patch-astro-prerender-dir] 找不到 astro/dist/prerender/utils.js，请先安装依赖。');
  process.exit(1);
}

const original = readFileSync(utilsPath, 'utf8');

if (original.includes(MARKER)) {
  console.log('[patch-astro-prerender-dir] 补丁已存在，跳过。');
  process.exit(0);
}

const anchor = `function getPrerenderOutputDirectory(settings) {
  return new URL("./.prerender/", getServerOutputDirectory(settings));
}`;

if (!original.includes(anchor)) {
  console.error('[patch-astro-prerender-dir] 未找到预期函数体，Astro 版本可能已变化，请人工检查：');
  console.error(`  ${utilsPath}`);
  process.exit(1);
}

const patched = original.replace(
  anchor,
  `function getPrerenderOutputDirectory(settings) {
  // 受限环境补丁：允许把预渲染中间目录重定向到可安全删除的位置，
  // 否则构建收尾的 rm 会被安全策略拒绝并中断整个构建。
  const override = process.env.${MARKER};
  if (override) {
    return new URL("file:///" + override.replace(/\\\\/g, "/").replace(/^\\//, "") + "/.prerender/");
  }
  return new URL("./.prerender/", getServerOutputDirectory(settings));
}`,
);

writeFileSync(utilsPath, patched, 'utf8');
console.log(`[patch-astro-prerender-dir] 补丁已写入：${utilsPath}`);
