import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
  createCommonContentSchema,
  createInterestsSchema,
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
    const slug = 'projects/fixture';
    expect(
      schema.parse({ ...validContent, slug, status: 'active', category: 'research' })
        .status,
    ).toBe('active');
    expect(() =>
      schema.parse({ ...validContent, slug, status: 'paused', category: 'research' }),
    ).toThrow();
  });
});

describe('interests schema', () => {
  const interestsBase = { ...validContent, slug: 'interests' };

  it('默认 heroImages / cards 为空数组', () => {
    const parsed = createInterestsSchema(image).parse(interestsBase);
    expect(parsed.heroImages).toEqual([]);
    expect(parsed.cards).toEqual([]);
  });

  it('接受缺少 image 的 hero 与 card（缺图走 CSS 占位）', () => {
    const parsed = createInterestsSchema(image).parse({
      ...interestsBase,
      heroImages: [{ title: '左图', body: '介绍' }],
      cards: [{ title: '卡一', subtitle: '副', body: '正文' }],
    });
    expect(parsed.heroImages).toHaveLength(1);
    expect(parsed.heroImages[0].image).toBeUndefined();
    expect(parsed.cards[0].subtitle).toBe('副');
  });

  it('heroImages 最多两张', () => {
    const heroImages = [1, 2, 3].map((n) => ({ title: `图${n}`, body: '介绍' }));
    expect(() =>
      createInterestsSchema(image).parse({ ...interestsBase, heroImages }),
    ).toThrow();
  });

  it('card 的 frame 必须是六位十六进制色', () => {
    const build = (frame: string) =>
      createInterestsSchema(image).parse({
        ...interestsBase,
        cards: [{ title: '卡', body: '正文', frame }],
      });
    expect(build('#D4537E').cards[0].frame).toBe('#D4537E');
    expect(() => build('D4537E')).toThrow();
    expect(() => build('#D4537')).toThrow();
    expect(() => build('#GGGGGG')).toThrow();
  });

  it('card 的 title / body 不可为空', () => {
    const schema = createInterestsSchema(image);
    expect(() =>
      schema.parse({ ...interestsBase, cards: [{ title: '', body: '正文' }] }),
    ).toThrow();
    expect(() =>
      schema.parse({ ...interestsBase, cards: [{ title: '卡', body: '  ' }] }),
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
