import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const { NO_COLOR: _noColor, FORCE_COLOR: _forceColor, ...baseEnv } = process.env;
const env = {...baseEnv,CI:'true',ASTRO_TELEMETRY_DISABLED:'1'};
const server = spawn(process.execPath, [resolve('scripts/playwright-site.mjs')], { stdio:'inherit', env });
const deadline = Date.now() + 120_000;
let ready = false;
while (Date.now() < deadline) {
  try { const response = await fetch('http://127.0.0.1:4321/MyWebsite/'); if (response.ok) { ready = true; break; } } catch {}
  await new Promise((resolveWait)=>setTimeout(resolveWait,250));
}
if (!ready) { server.kill(); throw new Error('Playwright 测试服务器未在 120 秒内就绪'); }
let status = 1;
try {
  const cli = resolve('node_modules/@playwright/test/cli.js');
  const result = spawnSync(process.execPath,[cli,'test',...process.argv.slice(2)],{stdio:'inherit',env:{...env,PLAYWRIGHT_EXTERNAL_SERVER:'1'}});
  status = result.status ?? 1;
} finally {
  server.kill();
}
process.exit(status);
