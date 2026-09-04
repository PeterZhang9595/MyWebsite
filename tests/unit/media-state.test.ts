import { describe, expect, it } from 'vitest';
import { canLoadVideo, selectInitialQuote, selectNextQuote } from '../../src/lib/media-state';

const quotes = [{ id: 'one' }, { id: 'two' }];

describe('media state', () => {
  it('keeps a known quote and advances without an immediate repeat', () => {
    expect(selectInitialQuote(quotes, 'two')?.id).toBe('two');
    expect(selectInitialQuote([], null)).toBeNull();
    expect(selectNextQuote(quotes, 'one').id).toBe('two');
  });

  it('does not load video on mobile or reduced motion', () => {
    expect(canLoadVideo({ mobile: true, reducedMotion: false })).toBe(false);
    expect(canLoadVideo({ mobile: false, reducedMotion: true })).toBe(false);
    expect(canLoadVideo({ mobile: false, reducedMotion: false })).toBe(true);
  });
});
