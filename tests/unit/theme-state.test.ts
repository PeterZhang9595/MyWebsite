import { describe, expect, it } from 'vitest';
import { resolveInitialTheme } from '../../src/lib/theme-state';

describe('theme state', () => {
  it.each([
    [null, 'light'],
    ['system', 'light'],
    ['invalid', 'light'],
    ['light', 'light'],
    ['dark', 'dark'],
  ] as const)('resolves %s to %s', (saved, expected) => {
    expect(resolveInitialTheme(saved)).toBe(expected);
  });
});
