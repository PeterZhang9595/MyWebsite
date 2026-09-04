export type Theme = 'light' | 'dark';

export function resolveInitialTheme(saved: string | null): Theme {
  return saved === 'dark' ? 'dark' : 'light';
}
