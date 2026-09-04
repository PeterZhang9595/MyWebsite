type Node = { type: string; value?: string; children?: Node[]; data?: { hName?: string; hProperties?: Record<string, string> } };
const kinds = new Set(['NOTE', 'TIP', 'IMPORTANT', 'WARNING']);

export default function remarkCallouts() {
  return (tree: Node) => visit(tree);
}

function visit(node: Node) {
  if (node.type === 'blockquote') transform(node);
  node.children?.forEach(visit);
}

function transform(node: Node) {
  const text = node.children?.[0]?.children?.[0];
  if (text?.type !== 'text' || !text.value) return;
  const match = text.value.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING)\](?:\r?\n)?/);
  if (!match || !kinds.has(match[1])) return;
  const kind = match[1].toLowerCase();
  text.value = text.value.slice(match[0].length);
  node.data = { hName: 'aside', hProperties: { 'data-callout': kind, className: `callout callout--${kind}` } };
}
