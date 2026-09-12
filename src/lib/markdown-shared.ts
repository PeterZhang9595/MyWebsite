/**
 * 主 Markdown 处理器与卡片背面处理器**共用**的插件数组。
 *
 * 为什么抽出来：两处各自写一份，就会出现「改了一处忘了另一处」的漂移——
 * 文章正文里生效的公式与提示块，在卡片背面悄悄失效（或反之）。
 * 共享一份数组后，新增插件天然对两边同时生效。
 *
 * 两边的差异只有一处，并且是刻意的：**卡片背面额外挂「剥离原始 HTML」插件**
 * （见 `src/lib/card-body.ts`），因为那条约束只应作用于背面，不应改变文章正文的既有行为。
 */
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkCallouts from '../plugins/remark-callouts';
import rehypeBaseRelativeUrls from '../plugins/rehype-base-relative-urls';

export const remarkPlugins = [remarkMath, remarkCallouts];
// rehypeBaseRelativeUrls 放在共享数组里：`![](/foo.png)` 这类站点根相对地址
// 在文章正文与卡片背面都缺 base 前缀，属于同一类缺陷，一次修两处。
export const rehypePlugins = [rehypeKatex, rehypeBaseRelativeUrls];
