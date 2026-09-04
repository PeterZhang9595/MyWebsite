import { describe, expect, it } from 'vitest';
import remarkCallouts from '../../src/plugins/remark-callouts';

function transform(marker: string) {
  const tree: any = { type: 'root', children: [{ type: 'blockquote', children: [{ type: 'paragraph', children: [{ type: 'text', value: `${marker}\nBody` }] }] }] };
  remarkCallouts()(tree);
  return tree.children[0];
}

describe('remark callouts', () => {
  it('converts supported GitHub alert markers', () => {
    const node = transform('[!NOTE]');
    expect(node.data.hProperties['data-callout']).toBe('note');
    expect(node.children[0].children[0].value).toBe('Body');
  });

  it('leaves unsupported blockquotes unchanged', () => {
    expect(transform('[!UNKNOWN]').data).toBeUndefined();
  });
});
