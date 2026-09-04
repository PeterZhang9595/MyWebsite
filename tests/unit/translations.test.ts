import { describe, expect, it } from 'vitest';
import { languageSwitchTarget } from '../../src/lib/translations';

describe('language switch', () => {
  it('uses an exact translation when available', () => {
    expect(
      languageSwitchTarget({
        targetLang: 'en',
        section: 'notes',
        translatedSlug: 'notes/policy-gradient',
      }),
    ).toBe('/en/notes/policy-gradient/');
  });

  it('falls back to the target-language section index', () => {
    expect(
      languageSwitchTarget({ targetLang: 'en', section: 'notes' }),
    ).toBe('/en/notes/');
  });
});
