import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { bioSchema, createInterestsSchema, createNoteSchema, createProjectSchema, createTipSchema } from './lib/content-schema';

const root = process.env.TEST_CONTENT_FIXTURES === '1' ? './tests/fixtures/content' : './src/content';
const loader = (name: string, lang: 'zh' | 'en') => glob({ base: `${root}/${name}/${lang}`, pattern: '**/*.{md,mdx}' });

const bioZh = defineCollection({ loader: loader('bio', 'zh'), schema: bioSchema });
const bioEn = defineCollection({ loader: loader('bio', 'en'), schema: bioSchema });
const notesZh = defineCollection({ loader: loader('notes', 'zh'), schema: ({ image }) => createNoteSchema(image) });
const notesEn = defineCollection({ loader: loader('notes', 'en'), schema: ({ image }) => createNoteSchema(image) });
const tipsZh = defineCollection({ loader: loader('tips', 'zh'), schema: ({ image }) => createTipSchema(image) });
const tipsEn = defineCollection({ loader: loader('tips', 'en'), schema: ({ image }) => createTipSchema(image) });
const projectsZh = defineCollection({ loader: loader('projects', 'zh'), schema: ({ image }) => createProjectSchema(image) });
const projectsEn = defineCollection({ loader: loader('projects', 'en'), schema: ({ image }) => createProjectSchema(image) });
const interestsZh = defineCollection({ loader: loader('interests', 'zh'), schema: ({ image }) => createInterestsSchema(image) });
const interestsEn = defineCollection({ loader: loader('interests', 'en'), schema: ({ image }) => createInterestsSchema(image) });

export const collections = { bioZh, bioEn, notesZh, notesEn, tipsZh, tipsEn, projectsZh, projectsEn, interestsZh, interestsEn };
