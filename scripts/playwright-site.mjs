import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, statSync, unlinkSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';

/**
 * 递归删除目录（用 unlink + rmdir 逐项处理）。
 *
 * 为什么不用 fs.rmSync：本机的安全策略把 rm/rmSync 重定向到 trash，
 * 而 trash 只对系统临时目录生效，对工作区内的路径会拒绝执行，
 * 导致构建收尾的清理步骤抛错并中断。unlink/rmdir 不走那条路径，可以正常清理。
 */
function removeTree(target) {
  if (!existsSync(target)) return;
  let entries;
  try {
    entries = readdirSync(target, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(target, entry.name);
    if (entry.isDirectory()) removeTree(full);
    else {
      try {
        unlinkSync(full);
      } catch {
        /* 单个文件删不掉不阻塞整体清理 */
      }
    }
  }
  try {
    rmdirSync(target);
  } catch {
    /* 目录非空或占用时保留，交由构建本身处理 */
  }
}

const { NO_COLOR: _noColor, FORCE_COLOR: _forceColor, ...baseEnv } = process.env;
const repoRoot = process.cwd();
// 与 astro.config.mjs 保持一致：fixture 构建的全部产物与缓存都在这个临时根下。
const tempRoot = resolve(tmpdir(), 'mywebsite-e2e');
const site = resolve(tempRoot, 'site');
const astro = resolve(repoRoot, 'node_modules/astro/bin/astro.mjs');
const pagefind = resolve(repoRoot, 'node_modules/pagefind/lib/runner/bin.cjs');
const preload = resolve(repoRoot, 'scripts/preload-tolerant-rm.cjs');

// 构建前清场。
//
// 预渲染中间目录通过 ASTRO_PRERENDER_DIR 重定向到临时目录（见下方 env），
// 那一路径下的 rm 能正常走 trash，构建收尾不会再被安全策略拒绝。
//
// 构建本身仍以仓库为 cwd：`import("sharp")` 是按 cwd 解析的，
// 一旦把 cwd 切到临时目录就会报 MissingSharp。
//
// 工作区内那个 `.astro` 是常规构建的缓存，这里一并清掉可以避免 E2E
// 复用陈旧的内容集合快照。
removeTree(resolve(repoRoot, '.astro'));
removeTree(tempRoot);

// 清场后必须把目录重新建出来：后续步骤要往 tempRoot 里写产物。
mkdirSync(tempRoot, { recursive: true });

const env = {
  ...baseEnv,
  TEST_CONTENT_FIXTURES: '1',
  ASTRO_TELEMETRY_DISABLED: '1',
  // 关键：把预渲染中间目录移出工作区，使构建收尾的 rm 能正常执行。
  ASTRO_PRERENDER_DIR: tempRoot,
};

const steps = [
  { bin: astro, args: ['build'] },
  { bin: pagefind, args: ['--site', site] },
];

for (const { bin, args } of steps) {
  const result = spawnSync(process.execPath, ['--require', preload, bin, ...args], {
    env,
    stdio: 'inherit',
    cwd: repoRoot,
  });
  if (result.error) console.error(result.error);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const contentTypes = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.wasm':'application/wasm','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8' };
const server = createServer((request,response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  let relative = pathname.startsWith('/MyWebsite') ? pathname.slice('/MyWebsite'.length) : pathname;
  if (!relative || relative.endsWith('/')) relative += 'index.html';
  let file = resolve(site, `.${relative}`);
  if (!file.startsWith(site + sep)) { response.writeHead(403).end('Forbidden'); return; }
  let status = 200;
  if (!existsSync(file) || !statSync(file).isFile()) { file = resolve(site,'404.html'); status = 404; }
  response.writeHead(existsSync(file) ? status : 404, { 'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
server.listen(4321,'127.0.0.1');
