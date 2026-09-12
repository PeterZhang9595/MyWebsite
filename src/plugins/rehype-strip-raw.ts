/**
 * 剥离原始 HTML 节点（rehype 插件）。
 *
 * 卡片背面的正文来自 frontmatter 字符串。原实现用 `textContent` 渲染，
 * 底线是「永不执行字符串里的标记」。改为构建期编译 Markdown 后，
 * 能进 DOM 的标签集合必须由**构建期的白名单**决定，而不是由内容字符串决定。
 *
 * CommonMark 会把 `<script>`、`<div>` 这类原始 HTML 解析成 `raw` 节点。
 * 本插件把它们整棵删掉——**不作为文本保留**，避免出现
 * 「代码里写着尖括号却没生效」这种困惑。
 *
 * 位置很关键：Astro 在 rehype 插件之后才挂 `rehypeRaw`（把 raw 节点还原成真元素），
 * 所以在这里删掉，`rehypeRaw` 就没有东西可还原。
 */

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

export default function rehypeStripRawHtml() {
  return (tree: Node) => {
    strip(tree);
  };
}

function strip(node: Node) {
  if (!node.children) return;
  node.children = node.children.filter((child) => child.type !== 'raw');
  node.children.forEach(strip);
}
