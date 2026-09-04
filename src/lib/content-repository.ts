import { getCollection } from 'astro:content';
import { getGitDates, resolveContentDates } from './git-dates';
import type { ContentDates, Lang, Section } from './types';

export interface ContentItem {
  id: string;
  data: {
    title: string; description: string; lang: Lang; slug: string; translationKey?: string;
    draft: boolean; tags: string[]; order?: number; status?: string; technologies?: string[];
    repositoryUrl?: string; demoUrl?: string; publishedAtOverride?: Date; updatedAtOverride?: Date;
  };
  entry: any;
  filePath?: string;
  isDirectory: boolean;
  dates: ContentDates | null;
}

const names: Record<Section, Record<Lang, string>> = {
  notes: { zh: 'notesZh', en: 'notesEn' }, tips: { zh: 'tipsZh', en: 'tipsEn' },
  projects: { zh: 'projectsZh', en: 'projectsEn' }, interests: { zh: 'interestsZh', en: 'interestsEn' },
};
const cache = new Map<string, ContentItem[]>();

export async function loadPublicContent(section: Section, lang: Lang): Promise<ContentItem[]> {
  const key = `${section}:${lang}`;
  if (cache.has(key)) return cache.get(key)!;
  const entries = await getCollection(names[section][lang] as any) as any[];
  const seen = new Set<string>();
  const items = entries.filter((entry) => !entry.data.draft).map((entry) => {
    if (entry.data.lang !== lang) throw new Error(`内容语言与目录不一致：${entry.id}`);
    if (!(entry.data.slug === section || entry.data.slug.startsWith(`${section}/`))) throw new Error(`slug 未以栏目开头：${entry.data.slug}`);
    if (seen.has(entry.data.slug)) throw new Error(`重复 slug：${lang}/${entry.data.slug}`);
    seen.add(entry.data.slug);
    const filePath = entry.filePath as string | undefined;
    const dates = resolveContentDates({
      draft: false,
      git: filePath ? getGitDates(filePath) : null,
      publishedAtOverride: entry.data.publishedAtOverride,
      updatedAtOverride: entry.data.updatedAtOverride,
      path: filePath ?? entry.id,
    });
    return { id: entry.id, data: entry.data, entry, filePath, isDirectory: /(^|\/)\_index\.(md|mdx)$/.test(filePath?.replaceAll('\\','/') ?? entry.id), dates } as ContentItem;
  });
  items.sort((a,b) => (a.data.order ?? Number.MAX_SAFE_INTEGER)-(b.data.order ?? Number.MAX_SAFE_INTEGER) || a.data.title.localeCompare(b.data.title) || a.data.slug.localeCompare(b.data.slug));
  cache.set(key, items);
  return items;
}

export async function findTranslatedItem(item: ContentItem, section: Section, targetLang: Lang) {
  if (!item.data.translationKey) return undefined;
  return (await loadPublicContent(section, targetLang)).find((candidate) => candidate.data.translationKey === item.data.translationKey);
}

export function directChildren(items: ContentItem[], directorySlug: string) {
  const prefix = `${directorySlug}/`;
  const direct = items.filter((item) => item.data.slug.startsWith(prefix) && !item.data.slug.slice(prefix.length).includes('/'));
  return { directories: direct.filter((item) => item.isDirectory), articles: direct.filter((item) => !item.isDirectory) };
}
