import { describe, expect, it } from 'vitest';
import * as urls from '../../src/lib/urls';

const { canonicalUrl, contentPath, withBase } = urls;

describe('URL helpers', () => {
  it('applies the GitHub Pages base once', () => {
    expect(withBase('/en/notes/')).toBe('/MyWebsite/en/notes/');
    expect(withBase('/MyWebsite/en/notes/')).toBe('/MyWebsite/en/notes/');
    expect(withBase('/pagefind/pagefind.js')).toBe('/MyWebsite/pagefind/pagefind.js');
  });

  it('builds canonical and localized content paths', () => {
    expect(canonicalUrl('/notes/')).toBe(
      'https://peterzhang9595.github.io/MyWebsite/notes/',
    );
    expect(contentPath('en', 'notes/cs285')).toBe('/en/notes/cs285/');
  });

  it('adds the deployment base to local data links and preserves external URLs', () => {
    expect(urls.localDataHref).toBeTypeOf('function');
    expect(urls.localDataHref('/notes/cs285/')).toBe('/MyWebsite/notes/cs285/');
    expect(urls.localDataHref('https://example.com/notes')).toBe(
      'https://example.com/notes',
    );
  });
});
