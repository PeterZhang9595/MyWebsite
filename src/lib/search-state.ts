interface KeyInput { key: string; ctrlKey: boolean; metaKey: boolean }
export type SearchCommand = 'open-search' | 'close-search';

export function normalizeShortcut(event: KeyInput): SearchCommand | null {
  if (event.key === 'Escape') return 'close-search';
  if (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) return 'open-search';
  return null;
}
