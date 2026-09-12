import { describe, expect, it } from 'vitest';
import rehypeBaseRelativeUrls, { withBasePrefix } from '../../src/plugins/rehype-base-relative-urls';
import { siteConfig } from '../../src/site.config';

const base = siteConfig.basePath;

describe('withBasePrefix', () => {
  it('给站点根相对地址补上 base', () => {
    expect(withBasePrefix('/social/default.png')).toBe(`${base}/social/default.png`);
    expect(withBasePrefix('/notes/foo/')).toBe(`${base}/notes/foo/`);
  });

  it('幂等：已经带 base 的不重复添加', () => {
    const once = withBasePrefix('/media/a.png');
    expect(withBasePrefix(once)).toBe(once);
    expect(withBasePrefix(base)).toBe(base);
  });

  it('不动相对路径、外链与协议相对地址', () => {
    expect(withBasePrefix('./rich-content-image.png')).toBe('./rich-content-image.png');
    expect(withBasePrefix('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(withBasePrefix('//cdn.example.com/a.png')).toBe('//cdn.example.com/a.png');
    expect(withBasePrefix('#section')).toBe('#section');
  });

  it('不归一化路径（不补结尾斜杠、不吞锚点）', () => {
    expect(withBasePrefix('/notes/foo#demo')).toBe(`${base}/notes/foo#demo`);
    expect(withBasePrefix('/a?x=1')).toBe(`${base}/a?x=1`);
  });
});

describe('rehypeBaseRelativeUrls', () => {
  const run = (tree: any) => {
    rehypeBaseRelativeUrls()(tree);
    return tree;
  };

  it('改写 img 的 src 与 a 的 href', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'img', properties: { src: '/social/default.png', alt: 'x' } },
        { type: 'element', tagName: 'a', properties: { href: '/notes/foo/' }, children: [] },
      ],
    };
    run(tree);
    expect(tree.children[0].properties.src).toBe(`${base}/social/default.png`);
    expect(tree.children[1].properties.href).toBe(`${base}/notes/foo/`);
  });

  it('递归处理嵌套节点，且不碰非 element 节点', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          children: [{ type: 'element', tagName: 'img', properties: { src: '/a.png' } }],
        },
        { type: 'text', value: '/b.png' },
      ],
    };
    run(tree);
    const nested = tree.children[0] as { children: Array<{ properties: { src?: string } }> };
    expect(nested.children[0]!.properties.src).toBe(`${base}/a.png`);
    expect(tree.children[1]!.value).toBe('/b.png');
  });
});
