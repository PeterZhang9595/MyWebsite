import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import remarkCallouts from './src/plugins/remark-callouts.ts';
import { unified } from '@astrojs/markdown-remark';

// fixture 构建（E2E）把缓存与产物全部放进系统临时目录。
//
// 背景：本机安全策略把 rm / rmSync 重定向到 trash，而 trash 只对系统临时目录
// 生效，对工作区内的路径会直接拒绝。Astro 构建收尾必然要删掉预渲染中间目录
// （见 core/build/static-build.js），一旦该目录落在工作区内，构建就会以非 0 退出。
//
// 该目录的位置并不由 outDir 单独决定：Astro 走的是
// getPrerenderOutputDirectory → getServerOutputDirectory → getOutDirWithinCwd(outDir)，
// 而 getOutDirWithinCwd 在 outDir 位于 cwd 之外时会回退到 `<cwd>/.astro/`。
// 因此除了把 outDir 指向临时目录，还需要 scripts/patch-astro-prerender-dir.mjs
// 配合 ASTRO_PRERENDER_DIR 把预渲染目录也重定向出去（构建 cwd 必须留在仓库，
// 否则 import("sharp") 会解析失败）。
const isFixtures = process.env.TEST_CONTENT_FIXTURES === '1';
const tempRoot = resolve(tmpdir(), 'mywebsite-e2e');

export default defineConfig({
  site: 'https://peterzhang9595.github.io',
  base: '/MyWebsite',
  output: 'static',
  cacheDir: isFixtures ? resolve(tempRoot, 'cache') : './.astro',
  outDir: isFixtures ? resolve(tempRoot, 'site') : './dist',
  vite: {
    build: {
      // 受限环境下 Astro 的清空动作会中断构建；清空由测试脚本自行负责。
      emptyOutDir: false,
    },
  },
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
