import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import { createProjectSchema } from '../../src/lib/content-schema';
import {
  groupByCategory,
  projectCategories,
  projectCategoryLabel,
  projectCategoryLabels,
} from '../../src/lib/project-categories';
import type { ProjectCategory } from '../../src/lib/project-categories';

const image = () => z.string();

const validProject = {
  title: 'Fixture Project',
  description: 'Fixture description',
  lang: 'zh' as const,
  slug: 'projects/fixture',
  status: 'active' as const,
};

interface FixtureChild {
  name: string;
  category: ProjectCategory;
}

describe('project categories', () => {
  it('keeps the agreed display order', () => {
    expect(projectCategories).toEqual([
      'course-assignment',
      'personal-tool',
      'competition',
      'research',
      'large-project',
    ]);
  });

  it('labels every category in both languages', () => {
    for (const category of projectCategories) {
      expect(projectCategoryLabel('zh', category)).toBeTruthy();
      expect(projectCategoryLabel('en', category)).toBeTruthy();
    }
    expect(Object.keys(projectCategoryLabels.zh)).toHaveLength(projectCategories.length);
    expect(Object.keys(projectCategoryLabels.en)).toHaveLength(projectCategories.length);
  });

  it('groups items in the fixed order and drops empty groups', () => {
    const items: FixtureChild[] = [
      { name: 'a', category: 'research' },
      { name: 'b', category: 'course-assignment' },
      { name: 'c', category: 'research' },
    ];
    const groups = groupByCategory(items, (item) => item.category);
    expect(groups.map((group) => group.category)).toEqual(['course-assignment', 'research']);
    expect(groups[0]!.items.map((item) => item.name)).toEqual(['b']);
    expect(groups[1]!.items.map((item) => item.name)).toEqual(['a', 'c']);
  });

  it('returns no groups for an empty list', () => {
    expect(groupByCategory<FixtureChild>([], (item) => item.category)).toEqual([]);
  });
});

describe('project schema category', () => {
  it('accepts every approved category', () => {
    const schema = createProjectSchema(image);
    for (const category of projectCategories) {
      expect(schema.parse({ ...validProject, category }).category).toBe(category);
    }
  });

  it('requires a category', () => {
    expect(() => createProjectSchema(image).parse(validProject)).toThrow();
  });

  it('rejects unknown categories', () => {
    expect(() =>
      createProjectSchema(image).parse({ ...validProject, category: 'side-quest' }),
    ).toThrow();
  });
});
