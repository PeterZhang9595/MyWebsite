import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
import type { ContentDates } from './types';

const cache = new Map<string, ContentDates | null>();

export function getGitDates(filePath: string, repositoryRoot = process.cwd()): ContentDates | null {
  const relativePath = relative(repositoryRoot, filePath).replaceAll('\\', '/');
  if (cache.has(relativePath)) return cache.get(relativePath) ?? null;
  try {
    const lines = execFileSync('git', ['log', '--follow', '--format=%aI', '--', relativePath], {
      cwd: repositoryRoot,
      encoding: 'utf8',
    }).trim().split(/\r?\n/).filter(Boolean);
    const result = lines.length
      ? { publishedAt: new Date(lines.at(-1)!), updatedAt: new Date(lines[0]!) }
      : null;
    cache.set(relativePath, result);
    return result;
  } catch {
    cache.set(relativePath, null);
    return null;
  }
}

interface ResolveDatesInput {
  draft: boolean;
  git: ContentDates | null;
  publishedAtOverride?: Date;
  updatedAtOverride?: Date;
  path?: string;
}

export function resolveContentDates(input: ResolveDatesInput): ContentDates | null {
  const publishedAt = input.publishedAtOverride ?? input.git?.publishedAt;
  if (!publishedAt) {
    if (input.draft) return null;
    throw new Error(`已发布内容缺少日期来源：${input.path ?? 'unknown'}`);
  }
  return {
    publishedAt,
    updatedAt: input.updatedAtOverride ?? input.git?.updatedAt ?? publishedAt,
  };
}
