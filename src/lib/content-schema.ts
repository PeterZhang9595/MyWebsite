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
    // 卡片底部信息条的副标题。可选：未填写时组件回退显示必填的 `description`
    // （后者仍承担页面头部说明与 SEO 描述）。
    // 用 min(1) 而非只 trim()，是为了让「写了键但留空」当场报错，
    // 避免出现「配了副标题却什么都没显示」这种无声失败。清空请直接删掉该键。
    subtitle: z.string().trim().min(1).optional(),
  });
}

export function createInterestsSchema(image: ImageSchemaFactory) {
  return createCommonContentSchema(image).extend({
    order: z.number().int().optional(),
    // 一级主页：最多两张可点击大图（点击放大 → 翻面显示介绍）
    // image 可选：未配图时组件渲染 CSS 占位块，便于先搭版式、后续再补图。
    heroImages: z
      .array(
        z.object({
          image: image().optional(),
          title: z.string().trim().min(1),
          body: z.string().trim().min(1),
        }),
      )
      .max(2)
      .default([]),
    // 二级子页：卡牌墙（正面图 + 背面文字 + 可选帧色）
    cards: z
      .array(
        z.object({
          image: image().optional(),
          title: z.string().trim().min(1),
          subtitle: z.string().trim().optional(),
          body: z.string().trim().min(1),
          frame: z
            .string()
            .regex(/^#[0-9a-fA-F]{6}$/)
            .optional(),
        }),
      )
      .default([]),
  });
}

export const bioSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  lang: z.enum(['zh', 'en']),
  variant: z.enum(['default', 'long']),
  draft: z.boolean().default(true),
});
