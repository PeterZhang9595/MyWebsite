import { sectionPath, ui } from '../i18n';
import { contentPath, withBase } from './urls';
import type { Lang, PathSegment, Section } from './types';

export function contentSegments(lang: Lang, section: Section, slug: string, title: string): PathSegment[] {
  const parts = slug.split('/');
  const segments: PathSegment[] = [{ label: '/root', href: withBase(lang === 'zh' ? '/' : '/en/') }];
  segments.push({ label: ui(lang, section), href: withBase(sectionPath(lang, section)) });
  const nested = parts.slice(1);
  nested.forEach((part, index) => {
    const isLast = index === nested.length - 1;
    segments.push({ label: isLast ? title : part, href: isLast ? undefined : withBase(contentPath(lang, [section, ...nested.slice(0,index+1)].join('/'))) });
  });
  if (!nested.length) segments[segments.length-1]!.href = undefined;
  return segments;
}
