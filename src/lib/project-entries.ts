import { contentPath, withBase } from './urls';
import type { ContentItem } from './content-repository';
import type { Lang } from './types';

export interface ProjectEntry {
  label: string;
  href: string;
  external?: boolean;
}

/**
 * 每个项目目录页可选的两个标准子页。子页存在时「核心功能」「开发过程」入口才会出现，
 * 避免出现指向不存在路由的死链。
 */
export const projectChildPages = [
  { key: 'features', zh: '核心功能', en: 'Features' },
  { key: 'dev-log', zh: '开发过程', en: 'Development log' },
] as const;

export function buildProjectEntries(
  lang: Lang,
  item: ContentItem,
  childSlugs: Set<string>,
): ProjectEntry[] {
  const entries: ProjectEntry[] = [];
  if (item.data.repositoryUrl) {
    entries.push({
      label: lang === 'zh' ? '代码仓库' : 'Repository',
      href: item.data.repositoryUrl,
      external: true,
    });
  }
  if (item.data.demoUrl) {
    entries.push({ label: 'Demo', href: item.data.demoUrl, external: true });
  }
  for (const page of projectChildPages) {
    const slug = `${item.data.slug}/${page.key}`;
    if (childSlugs.has(slug)) {
      entries.push({
        label: lang === 'zh' ? page.zh : page.en,
        href: withBase(contentPath(lang, slug)),
      });
    }
  }
  return entries;
}
