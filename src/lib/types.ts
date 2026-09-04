export type Lang = 'zh' | 'en';

export type Section = 'notes' | 'tips' | 'projects' | 'interests';

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface PathSegment {
  label: string;
  href?: string;
}

export interface ContentDates {
  publishedAt: Date;
  updatedAt: Date;
}
