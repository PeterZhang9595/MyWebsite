import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const { NO_COLOR: _noColor, FORCE_COLOR: _forceColor, ...baseEnv } = process.env;
const env = { ...baseEnv, TEST_CONTENT_FIXTURES: '1', ASTRO_TELEMETRY_DISABLED: '1' };
const site = resolve('tests/artifacts/2026-09-03-website-setup/site');
const astro = resolve('node_modules/astro/bin/astro.mjs');
const pagefind = resolve('node_modules/pagefind/lib/runner/bin.cjs');

for (const [bin, args] of [[astro, ['build']], [pagefind, ['--site', site]]]) {
  const result = spawnSync(process.execPath, [bin, ...args], { env, stdio: 'inherit' });
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
