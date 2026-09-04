import { siteConfig } from '../site.config';
import type { Lang } from './types';

function normalizePath(path: string): string {
  const cleaned = `/${path}`.replace(/\/{2,}/g, '/');
  const fileLike = /\/[^/]+\.[a-z0-9]+$/i.test(cleaned);
  if (fileLike) return cleaned;
  return cleaned === '/' ? '/' : `${cleaned.replace(/\/$/, '')}/`;
}

export function withBase(path: string): string {
  const normalized = normalizePath(path);
  const base = siteConfig.basePath;
  if (normalized === `${base}/` || normalized.startsWith(`${base}/`)) return normalized;
  return normalizePath(`${base}${normalized}`);
}

export function contentPath(lang: Lang, slug: string): string {
  return normalizePath(`${lang === 'en' ? '/en' : ''}/${slug}`);
}

export function localDataHref(href: string): string {
  return href.startsWith('/') ? withBase(href) : href;
}

export function canonicalUrl(path: string): string {
  return new URL(withBase(path), siteConfig.siteUrl).toString();
}
