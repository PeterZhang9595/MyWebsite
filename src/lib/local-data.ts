import { z } from 'astro/zod';
import recentFocusData from '../data/recent-focus.json';
import quotesData from '../data/quotes.json';

const id = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const recentFocusSchema = z.array(
  z.object({
    id,
    title: z.object({ zh: z.string().trim().min(1), en: z.string().trim().min(1) }),
    description: z
      .object({ zh: z.string().trim().min(1).optional(), en: z.string().trim().min(1).optional() })
      .optional(),
    url: z.url().or(z.string().regex(/^\/[a-z0-9/.-]*$/)).optional(),
    order: z.number().int(),
  }),
);

export const quotesSchema = z.array(
  z.object({
    id,
    text: z.string().trim().min(1),
    author: z.string().trim().min(1).optional(),
    source: z.string().trim().min(1).optional(),
    lang: z.string().trim().min(2),
  }),
);

export function loadRecentFocus() {
  return recentFocusSchema.parse(recentFocusData);
}

export function loadQuotes() {
  return quotesSchema.parse(quotesData);
}
