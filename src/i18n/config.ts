import type { Lang } from '../lib/types';

export const defaultLang: Lang = 'zh';
export const languages: readonly Lang[] = ['zh', 'en'];

export const htmlLang: Record<Lang, string> = {
  zh: 'zh-CN',
  en: 'en',
};
