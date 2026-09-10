import { z } from 'astro/zod';
import { projectCategories } from './project-categories';

type ImageSchemaFactory = () => z.ZodType;

export const stablePathPattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

export function createCommonContentSchema(image: ImageSchemaFactory) {
  return z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    lang: z.enum(['zh', 'en']),
    slug: z.string().regex(stablePathPattern),
    translationKey: z.string().regex(stablePathPattern).optional(),
    draft: z.boolean().default(true),
    tags: z.array(z.string().trim().min(1)).default([]),
    cover: image().optional(),
    publishedAtOverride: z.coerce.date().optional(),
    updatedAtOverride: z.coerce.date().optional(),
  });
}

export function createNoteSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    order: z.number().int().optional(),
  });
}

export function createTipSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    order: z.number().int(),
  });
}

export function createProjectSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    category: z.enum(projectCategories),
    status: z.enum(['active', 'completed', 'archived']),
    technologies: z.array(z.string().trim().min(1)).default([]),
    repositoryUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    order: z.number().int().optional(),
  });
}

export function createInterestsSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    order: z.number().int().optional(),
  });
}

export const bioSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  lang: z.enum(['zh', 'en']),
  variant: z.enum(['default', 'long']),
  draft: z.boolean().default(true),
});
