import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('GitHub Actions', () => {
  it('uses reproducible CI and complete Git history', () => {
    const ci = readFileSync('.github/workflows/ci.yml','utf8');
    expect(ci).toContain('fetch-depth: 0');
    expect(ci).toContain('pnpm install --frozen-lockfile');
    expect(ci).toContain('pnpm run build');
  });
  it('deploys dist with the required Pages permissions', () => {
    const deploy = readFileSync('.github/workflows/deploy.yml','utf8');
    expect(deploy).toContain('pages: write');
    expect(deploy).toContain('id-token: write');
    expect(deploy).toContain('path: dist');
    expect(deploy).not.toContain('gh-pages');
  });
});
