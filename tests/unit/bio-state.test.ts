import { describe, expect, it } from 'vitest';
import { initialBioVariant, selectBioVariant } from '../../src/lib/bio-state';

describe('bio state', () => {
  it('always starts with the default variant', () => {
    expect(initialBioVariant()).toBe('default');
  });

  it('selects long only when long content exists', () => {
    expect(selectBioVariant('default', 'long', true)).toBe('long');
    expect(selectBioVariant('default', 'long', false)).toBe('default');
  });
});
