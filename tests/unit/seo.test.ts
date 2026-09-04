import { describe, expect, it } from 'vitest';
import { buildAlternates, buildCanonical } from '../../src/lib/seo';

describe('SEO helpers', () => {
  it('builds a base-safe canonical URL', () => {
    expect(buildCanonical('/notes/fixture-note/')).toBe('https://peterzhang9595.github.io/MyWebsite/notes/fixture-note/');
  });

  it('emits alternates only for real translations', () => {
    expect(buildAlternates()).toEqual([]);
    expect(buildAlternates('/notes/a/', '/en/notes/a/')).toEqual([
      { hreflang: 'zh-CN', href: 'https://peterzhang9595.github.io/MyWebsite/notes/a/' },
      { hreflang: 'en', href: 'https://peterzhang9595.github.io/MyWebsite/en/notes/a/' },
    ]);
  });
});
