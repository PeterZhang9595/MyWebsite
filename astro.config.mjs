import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from './src/plugins/remark-callouts.ts';
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  site: 'https://peterzhang9595.github.io',
  base: '/MyWebsite',
  output: 'static',
  cacheDir:
    process.env.TEST_CONTENT_FIXTURES === '1'
      ? './tests/artifacts/2026-09-03-website-setup/.astro'
      : './.astro',
  outDir:
    process.env.TEST_CONTENT_FIXTURES === '1'
      ? './tests/artifacts/2026-09-03-website-setup/site'
      : './dist',
  integrations: [mdx({ extendMarkdownConfig: true }), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkCallouts],
      rehypePlugins: [rehypeKatex],
    }),
    syntaxHighlight: 'shiki',
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
