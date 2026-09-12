import type { Lang } from '../lib/types';

export type UiKey =
  | 'search'
  | 'theme'
  | 'switchLanguage'
  | 'bio'
  | 'defaultBio'
  | 'longBio'
  | 'recentFocus'
  | 'tips'
  | 'notes'
  | 'projects'
  | 'interests'
  | 'empty'
  | 'changeQuote'
  | 'backParent';

const dictionary: Record<Lang, Record<UiKey, string>> = {
  zh: {
    search: '搜索', theme: '切换主题', switchLanguage: '切换语言', bio: '简介',
    defaultBio: '默认', longBio: '完整', recentFocus: '近期关注', tips: 'Tips',
    notes: '笔记', projects: '项目', interests: '兴趣', empty: '内容整理中',
    changeQuote: '换一个', backParent: '返回上一级',
  },
  en: {
    search: 'Search', theme: 'Toggle theme', switchLanguage: 'Switch language', bio: 'Bio',
    defaultBio: 'Default', longBio: 'Long', recentFocus: 'Recent Focus', tips: 'Tips',
    notes: 'Notes', projects: 'Projects', interests: 'Interests', empty: 'Content pending',
    changeQuote: 'Change quote', backParent: 'Go to parent',
  },
};

export function ui(lang: Lang, key: UiKey): string {
  return dictionary[lang][key];
}
