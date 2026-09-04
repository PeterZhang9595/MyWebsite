import { describe, expect, it } from 'vitest';
import { resolveContentDates } from '../../src/lib/git-dates';

const publishedAtOverride = new Date('2026-01-01T00:00:00.000Z');

describe('date policy', () => {
  it('allows uncommitted drafts without dates', () => {
    expect(resolveContentDates({ draft: true, git: null })).toBeNull();
  });

  it('rejects published content without a date source', () => {
    expect(() => resolveContentDates({ draft: false, git: null })).toThrow();
  });

  it('uses a publication override for both dates when Git is unavailable', () => {
    expect(resolveContentDates({ draft: false, git: null, publishedAtOverride })).toEqual({
      publishedAt: publishedAtOverride,
      updatedAt: publishedAtOverride,
    });
  });
});
