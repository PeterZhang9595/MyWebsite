import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getGitDates } from '../../src/lib/git-dates';

const directories: string[] = [];
afterEach(() => { while (directories.length) rmSync(directories.pop()!, { recursive:true, force:true }); });

describe('Git date integration', () => {
  it('reads the earliest and latest commit dates', () => {
    const root = mkdtempSync(join(tmpdir(),'website-git-dates-')); directories.push(root);
    const file = join(root,'note.md');
    execFileSync('git',['init','-b','main'],{cwd:root});
    execFileSync('git',['config','user.email','fixture@example.com'],{cwd:root});
    execFileSync('git',['config','user.name','Fixture'],{cwd:root});
    writeFileSync(file,'one'); execFileSync('git',['add','note.md'],{cwd:root});
    execFileSync('git',['commit','-m','first'],{cwd:root,env:{...process.env,GIT_AUTHOR_DATE:'2026-01-01T00:00:00Z',GIT_COMMITTER_DATE:'2026-01-01T00:00:00Z'}});
    writeFileSync(file,'two'); execFileSync('git',['add','note.md'],{cwd:root});
    execFileSync('git',['commit','-m','second'],{cwd:root,env:{...process.env,GIT_AUTHOR_DATE:'2026-01-03T00:00:00Z',GIT_COMMITTER_DATE:'2026-01-03T00:00:00Z'}});
    const dates = getGitDates(file,root)!;
    expect(dates.publishedAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
    expect(dates.updatedAt.toISOString()).toBe('2026-01-03T00:00:00.000Z');
  });
});
