import type { Lang, Section } from '../lib/types';

export function sectionPath(lang: Lang, section: Section): string {
  return lang === 'zh' ? `/${section}/` : `/en/${section}/`;
}
