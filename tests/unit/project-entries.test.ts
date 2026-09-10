import { describe, expect, it } from 'vitest';
import { buildProjectEntries, projectChildPages } from '../../src/lib/project-entries';
import type { ContentItem } from '../../src/lib/content-repository';

function makeItem(overrides: Partial<ContentItem['data']> = {}): ContentItem {
  return {
    id: 'fixture',
    data: {
      title: 'Fixture',
      description: 'Fixture description',
      lang: 'zh',
      slug: 'projects/large-enterprise',
      draft: false,
      tags: [],
      ...overrides,
    },
    entry: {},
    isDirectory: true,
    dates: null,
  } as ContentItem;
}

describe('buildProjectEntries', () => {
  it('returns nothing for a project without links or child pages', () => {
    expect(buildProjectEntries('zh', makeItem(), new Set())).toEqual([]);
  });

  it('adds external links before child page entries', () => {
    const entries = buildProjectEntries(
      'zh',
      makeItem({ repositoryUrl: 'https://github.com/example/x', demoUrl: 'https://example.com' }),
      new Set(),
    );
    expect(entries.map((entry) => entry.label)).toEqual(['代码仓库', 'Demo']);
    expect(entries.every((entry) => entry.external)).toBe(true);
  });

  it('adds a child page entry only when the page exists', () => {
    const existing = new Set(['projects/large-enterprise/features']);
    const entries = buildProjectEntries('zh', makeItem(), existing);
    expect(entries.map((entry) => entry.label)).toEqual(['核心功能']);
    expect(entries[0]!.href).toBe('/MyWebsite/projects/large-enterprise/features/');
    expect(entries[0]!.external).toBeUndefined();
  });

  it('uses English labels on the English side', () => {
    const existing = new Set([
      'projects/large-enterprise/features',
      'projects/large-enterprise/dev-log',
    ]);
    const entries = buildProjectEntries('en', makeItem(), existing);
    expect(entries.map((entry) => entry.label)).toEqual(['Features', 'Development log']);
  });

  it('exposes the reserved child page keys used to filter cards', () => {
    expect(projectChildPages.map((page) => page.key)).toEqual(['features', 'dev-log']);
  });
});
