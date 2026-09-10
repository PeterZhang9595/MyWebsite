import type { Lang } from './types';

/**
 * 项目完成状态的三态唯一真源。
 * schema 的 `status` 字段限 `active | completed | archived`，此处提供中英标签与色调映射。
 */
export const projectStatuses = ['active', 'completed', 'archived'] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export function isProjectStatus(value: string | undefined): value is ProjectStatus {
  return value === 'active' || value === 'completed' || value === 'archived';
}

export const projectStatusLabels: Record<Lang, Record<ProjectStatus, string>> = {
  zh: { active: '进行中', completed: '已完成', archived: '已归档' },
  en: { active: 'In progress', completed: 'Completed', archived: 'Archived' },
};

export function projectStatusLabel(lang: Lang, status: ProjectStatus): string {
  return projectStatusLabels[lang][status];
}

/**
 * 项目种类的唯一真源。
 *
 * 数组顺序即目录页分区的自上而下顺序；schema、组件、测试全部从这里取值，
 * 因此新增一种分类只需要在这里插入一项（并补上中英标签）。
 */
export const projectCategories = [
  'course-assignment',
  'personal-tool',
  'competition',
  'research',
  'large-project',
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export const projectCategoryLabels: Record<Lang, Record<ProjectCategory, string>> = {
  zh: {
    'course-assignment': '课程大作业',
    'personal-tool': '自用小项目',
    competition: '比赛项目',
    research: '科研项目',
    'large-project': '大型项目',
  },
  en: {
    'course-assignment': 'Course assignments',
    'personal-tool': 'Personal tools',
    competition: 'Competitions',
    research: 'Research',
    'large-project': 'Large projects',
  },
};

export function projectCategoryLabel(lang: Lang, category: ProjectCategory): string {
  return projectCategoryLabels[lang][category];
}

export interface CategoryGroup<T> {
  category: ProjectCategory;
  items: T[];
}

/**
 * 按 projectCategories 的固定顺序分组，并保持每组的原有顺序；空分组直接丢弃。
 */
export function groupByCategory<T>(
  items: T[],
  pick: (item: T) => ProjectCategory,
): CategoryGroup<T>[] {
  const groups = new Map<ProjectCategory, T[]>();
  for (const item of items) {
    const bucket = groups.get(pick(item));
    if (bucket) bucket.push(item);
    else groups.set(pick(item), [item]);
  }
  return projectCategories
    .filter((category) => groups.has(category))
    .map((category) => ({ category, items: groups.get(category)! }));
}
