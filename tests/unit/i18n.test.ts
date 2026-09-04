import { describe, expect, it } from 'vitest';
import { sectionPath, ui } from '../../src/i18n';

describe('i18n', () => {
  it('builds localized section paths', () => {
    expect(sectionPath('zh', 'notes')).toBe('/notes/');
    expect(sectionPath('en', 'notes')).toBe('/en/notes/');
  });

  it('returns translated UI labels', () => {
    expect(ui('zh', 'search')).toBe('搜索');
    expect(ui('en', 'search')).toBe('Search');
    expect(ui('zh', 'changeQuote')).toBe('换一个');
  });
});
