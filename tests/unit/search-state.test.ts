import { describe, expect, it } from 'vitest';
import { normalizeShortcut } from '../../src/lib/search-state';

describe('search shortcuts', () => {
  it('opens with ctrl/cmd+k and closes with escape', () => {
    expect(normalizeShortcut({ key: 'k', ctrlKey: true, metaKey: false })).toBe('open-search');
    expect(normalizeShortcut({ key: 'k', ctrlKey: false, metaKey: true })).toBe('open-search');
    expect(normalizeShortcut({ key: 'Escape', ctrlKey: false, metaKey: false })).toBe('close-search');
    expect(normalizeShortcut({ key: 'k', ctrlKey: false, metaKey: false })).toBeNull();
  });
});
