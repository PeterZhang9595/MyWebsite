/**
 * 给 Markdown 里的**站点根相对地址**补上站点 base（rehype 插件）。
 *
 * 为什么需要它：本站部署在 GitHub Pages 项目站下，`base = '/MyWebsite'`。
 * Markdown 里写 `![图](/social/default.png)` 会被原样输出成
 * `<img src="/social/default.png">` —— 线上会 404，正确地址是
 * `/MyWebsite/social/default.png`。Astro 只处理**相对路径**的图片
 * （走 `rehypeImages` + `astro:assets`），根相对地址它不管。
 *
 * 这个坑有一个很坏的隐蔽性：本地的 E2E 静态服务器同时接受
 * `/social/...` 与 `/MyWebsite/social/...`，所以「图片加载成功」的断言
 * 在本地照样通过，缺陷只在真正的 GitHub Pages 上出现。
 * 卡片背面设计文档 §3.4 明确规定图片走 `public/` + 站点绝对路径，
 * 所以这一层必须补上，否则那条约定本身就是坏的。
 *
 * 只做**前缀拼接**，不做路径归一化：`withBase()` 会把非文件路径补上结尾斜杠，
 * 那会把 `/notes/foo#demo` 变成 `/notes/foo#demo/`。这里刻意用最笨的拼接。
 */

import { siteConfig } from '../site.config';

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

/** 根相对 → 带 base；已经是 base 前缀、协议相对（`//host`）或非根相对的一律不动。 */
export function withBasePrefix(raw: string): string {
  const base = siteConfig.basePath;
  if (!raw.startsWith('/') || raw.startsWith('//')) return raw;
  if (raw === base || raw.startsWith(`${base}/`)) return raw;
  return `${base}${raw}`;
}

export default function rehypeBaseRelativeUrls() {
  return (tree: Node) => {
    visit(tree);
  };
}

function visit(node: Node) {
  if (node.type === 'element' && node.properties) {
    if (node.tagName === 'img' || node.tagName === 'source') {
      const src = node.properties.src;
      if (typeof src === 'string') node.properties.src = withBasePrefix(src);
    }
    if (node.tagName === 'a') {
      const href = node.properties.href;
      if (typeof href === 'string') node.properties.href = withBasePrefix(href);
    }
  }
  node.children?.forEach(visit);
}
