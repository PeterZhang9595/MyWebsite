import { describe, expect, it } from 'vitest';
import { listDirectChildren, sortEntries } from '../../src/lib/content-tree';

const entries = [
  { slug: 'notes/cs285', title: 'CS285', order: 1, isDirectory: true },
  { slug: 'notes/cs285/policy-gradient', title: 'Policy', order: 1, isDirectory: false },
  { slug: 'notes/cs285/deep/item', title: 'Deep', order: 2, isDirectory: false },
  { slug: 'notes/zeta', title: 'Zeta', isDirectory: false },
];

describe('content tree', () => {
  it('lists only direct children', () => {
    expect(listDirectChildren(entries, 'notes').directories.map((x) => x.slug)).toEqual(['notes/cs285']);
    expect(listDirectChildren(entries, 'notes/cs285').articles.map((x) => x.slug)).toEqual(['notes/cs285/policy-gradient']);
  });

  it('sorts order before title and slug', () => {
    expect(sortEntries([
      { slug: 'b', title: 'Beta' },
      { slug: 'z', title: 'Zulu', order: 2 },
      { slug: 'a', title: 'Alpha', order: 1 },
    ]).map((x) => x.slug)).toEqual(['a', 'z', 'b']);
  });
});
