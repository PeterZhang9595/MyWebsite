export interface TreeEntry {
  slug: string;
  title: string;
  order?: number;
  isDirectory: boolean;
}

export function sortEntries<T extends Pick<TreeEntry, 'slug' | 'title' | 'order'>>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (a.order !== undefined && b.order === undefined) return -1;
    if (a.order === undefined && b.order !== undefined) return 1;
    if (a.order !== undefined && b.order !== undefined && a.order !== b.order) return a.order - b.order;
    const title = a.title.localeCompare(b.title);
    return title || a.slug.localeCompare(b.slug);
  });
}

export function listDirectChildren<T extends TreeEntry>(entries: T[], directorySlug: string) {
  const prefix = `${directorySlug}/`;
  const direct = entries.filter((entry) => {
    if (!entry.slug.startsWith(prefix)) return false;
    return !entry.slug.slice(prefix.length).includes('/');
  });
  return {
    directories: sortEntries(direct.filter((entry) => entry.isDirectory)),
    articles: sortEntries(direct.filter((entry) => !entry.isDirectory)),
  };
}
