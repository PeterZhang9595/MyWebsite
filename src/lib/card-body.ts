/**
 * 卡片背面正文：构建期把 Markdown 字符串编译成 HTML。
 *
 * 与文章正文的关系：
 * - 共用同一份插件数组（`markdown-shared.ts`），所以公式语法两边一致；
 * - 但**多挂一个「剥离原始 HTML」插件** —— 这条约束只作用于卡片背面。
 *
 * 为什么用 `createMarkdownProcessor` 而不是直接拿 `unified`：
 * `@astrojs/markdown-remark` 导出的 `unified()` 返回的是 Astro 的
 * **processor 描述对象**（只有 `createRenderer`），不是一个可 `.render()` 的 unified 实例。
 * 真正能渲染的是 `createMarkdownProcessor()`；它同时免掉了直接依赖
 * `unified` / `remark-parse` / `rehype-stringify` 这些本项目并未声明的包。
 *
 * 关闭语法高亮（`syntaxHighlight: false`）是刻意的：背面是 68ch 窄栏，
 * 代码块体验差，设计上明确「不美化，只要求不破版」。关掉还省掉一个 Shiki 实例。
 *
 * 处理器用模块级 Promise 缓存，整个构建只创建一次。
 */
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { remarkPlugins, rehypePlugins } from './markdown-shared';
import rehypeStripRawHtml from '../plugins/rehype-strip-raw';
import rehypeTagBackBody from '../plugins/rehype-tag-back-body';

let pending: ReturnType<typeof createMarkdownProcessor> | null = null;

function processor() {
  pending ??= createMarkdownProcessor({
    syntaxHighlight: false,
    remarkPlugins,
    rehypePlugins: [...rehypePlugins, rehypeStripRawHtml, rehypeTagBackBody],
  });
  return pending;
}

/** 把 Markdown 字符串编译成可安全放进 `<template>` 的 HTML。 */
export async function renderCardBody(markdown: string): Promise<string> {
  const { code } = await (await processor()).render(markdown);
  return code;
}
