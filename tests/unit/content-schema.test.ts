import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
  createCommonContentSchema,
  createProjectSchema,
} from '../../src/lib/content-schema';
import {
  musicSchema,
  quotesSchema,
  recentFocusSchema,
} from '../../src/lib/local-data';

const image = () => z.string();

const validContent = {
  title: 'Fixture Note',
  description: 'Fixture description',
  lang: 'zh' as const,
  slug: 'notes/fixture-note',
};

describe('content schemas', () => {
  it('defaults new content to draft', () => {
    const parsed = createCommonContentSchema(image).parse(validContent);
    expect(parsed.draft).toBe(true);
  });

  it('rejects unsupported languages and unstable slugs', () => {
    const schema = createCommonContentSchema(image);
    expect(() => schema.parse({ ...validContent, lang: 'fr' })).toThrow();
    expect(() =>
      schema.parse({ ...validContent, slug: 'Notes/第三篇' }),
    ).toThrow();
  });

  it('accepts only approved project states', () => {
    const schema = createProjectSchema(image);
    expect(
      schema.parse({ ...validContent, slug: 'projects/fixture', status: 'active' })
        .status,
    ).toBe('active');
    expect(() =>
      schema.parse({ ...validContent, status: 'paused' }),
    ).toThrow();
  });
});

describe('local data schemas', () => {
  it('accepts empty first-version data', () => {
    expect(recentFocusSchema.parse([])).toEqual([]);
    expect(quotesSchema.parse([])).toEqual([]);
    expect(musicSchema.parse([])).toEqual([]);
  });

  it('requires provenance for future music', () => {
    expect(() =>
      musicSchema.parse([
        {
          id: 'track-1',
          title: 'Track',
          artist: 'Artist',
          src: '/media/audio/track.mp3',
        },
      ]),
    ).toThrow();
  });
});
