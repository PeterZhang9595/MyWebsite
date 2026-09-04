import { canonicalUrl } from './urls';

export interface AlternateLink { hreflang: 'zh-CN' | 'en'; href: string }

export function buildCanonical(path: string): string {
  return canonicalUrl(path);
}

export function buildAlternates(zhPath?: string, enPath?: string): AlternateLink[] {
  if (!zhPath || !enPath) return [];
  return [
    { hreflang: 'zh-CN', href: canonicalUrl(zhPath) },
    { hreflang: 'en', href: canonicalUrl(enPath) },
  ];
}
