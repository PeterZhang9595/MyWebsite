import { describe, expect, it } from 'vitest';
import { renderCardBody } from '../../src/lib/card-body';

/**
 * 卡片背面富文本的构建期编译。
 *
 * 这是本次改动风险最集中的地方：它把「客户端永不解析字符串」的边界
 * 从运行时挪到了构建期。所以每一条能力都要正面断言，
 * 每一条被禁掉的写法都要**反向**断言（不只断言「没有 `<script>`」，
 * 还要断言里头的文本也没留下）。
 */
describe('renderCardBody', () => {
  it('渲染强调语法的粗体', async () => {
    expect(await renderCardBody('**粗体**')).toContain('<strong>粗体</strong>');
  });

  it('渲染链接与列表', async () => {
    const html = await renderCardBody('- 一\n- 二');
    expect(html).toContain('<ul>');
    expect(html.match(/<li>/g)).toHaveLength(2);

    const linked = await renderCardBody('[示例](https://example.com)');
    expect(linked).toContain('href="https://example.com"');
  });

  it('渲染行内公式与独立公式', async () => {
    expect(await renderCardBody('$E = mc^2$')).toContain('class="katex"');
    // 独立公式必须写成 `$$` 独占一行 —— 写成单行 `$$...$$` 会被解析为**行内**公式，
    // 也就会渲染成 .katex 而不是 .katex-display。这条差异是本轮实测发现的。
    expect(await renderCardBody('$$\n\\nabla_\\theta J(\\theta)\n$$')).toContain(
      'class="katex-display"',
    );
    expect(await renderCardBody('$$\\nabla_\\theta J(\\theta)$$')).not.toContain(
      'class="katex-display"',
    );
  });

  it('渲染站点绝对路径的图片，并补上站点 base、保留 alt', async () => {
    const html = await renderCardBody('![图](/media/interests/a.png)');
    expect(html).toContain('<img');
    // 关键：必须补上 base —— 否则线上（项目站部署在 /MyWebsite 下）会 404，
    // 而本地 E2E 服务器两种路径都接受，所以这个缺陷本地测不出来。
    expect(html).toContain('src="/MyWebsite/media/interests/a.png"');
    expect(html).toContain('alt="图"');
    // 相对路径不补 base（由 Astro 的图片处理链路负责）
    const relative = await renderCardBody('![图](./a.png)');
    expect(relative).toContain('src="./a.png"');
  });

  it('给顶层段落补上背面正文类名', async () => {
    const html = await renderCardBody('第一段\n\n第二段');
    expect(html.match(/class="interests-overlay__back-body"/g)).toHaveLength(2);
  });

  it('剥离 <script>，且不把内容当文本留下', async () => {
    const html = await renderCardBody('<script>alert(1)</script>');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert(1)');
  });

  it('剥离带事件属性的原始 HTML 块', async () => {
    const html = await renderCardBody('<div onclick="x()">t</div>');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('<div');
  });

  it('剥离行内的原始 HTML 标签，保留其两侧的正文', async () => {
    const html = await renderCardBody('前 <span class="x">中</span> 后');
    expect(html).not.toContain('<span');
    expect(html).not.toContain('class="x"');
    expect(html).not.toContain('</span>');
    // 标签被剥掉，但它两侧的正文必须留下（否则等于把内容吃掉）
    expect(html).toContain('前');
    expect(html).toContain('后');
  });

  it('同一处理器可重复使用（模块级缓存不得串味）', async () => {
    const first = await renderCardBody('**A**');
    const second = await renderCardBody('*B*');
    expect(first).toContain('<strong>A</strong>');
    expect(second).toContain('<em>B</em>');
    expect(second).not.toContain('A');
  });
});
