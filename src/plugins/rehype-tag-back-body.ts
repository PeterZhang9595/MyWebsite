/**
 * 给卡片背面正文的**顶层段落**补上 `interests-overlay__back-body` 类名。
 *
 * 为什么需要它：构建期编译出来的段落是裸 `<p>`，而
 *   - `src/styles/interests.css` 里 `.interests-overlay__back-body` 承担段落的排版；
 *   - `tests/e2e/interests.spec.ts` 里有断言依赖该类名（背面段落文案）。
 * 不补类名就会同时打破样式与既有断言。补上之后类名在语义上也仍然成立：
 * 它确实是背面正文的一个段落。
 *
 * 只处理顶层段落（`[data-body]` 的直接子节点）。列表、图片、公式等块级元素
 * 由 `interests.css` 里的通用流式间距规则负责，不需要类名。
 */

const BACK_BODY_CLASS = 'interests-overlay__back-body';

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

export default function rehypeTagBackBody() {
  return (tree: Node) => {
    for (const node of tree.children ?? []) {
      if (node.type !== 'element' || node.tagName !== 'p') continue;
      const properties = (node.properties ??= {});
      const className = properties.className;
      const list = Array.isArray(className)
        ? className.slice()
        : typeof className === 'string' && className
          ? className.split(/\s+/)
          : [];
      if (!list.includes(BACK_BODY_CLASS)) list.push(BACK_BODY_CLASS);
      properties.className = list;
    }
  };
}
