import { unified } from 'unified';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';
import rehypeHighlight from 'rehype-highlight';

export async function renderMarkdown(markdownContent: string) {
    const processor = unified()
        .use(markdown)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight, {
            detect: true,
        })
        .use(() => (tree: any) => {
            let listItemCounter = 0;
            visit(tree, 'element', (node, index, parent) => {
                if ((node as any).tagName === 'li') {
                    (node as any).properties = {
                        ...(node as any).properties,
                        key: `list-item-${listItemCounter++}`,
                    };
                }
            });
        })
        .use(() => (tree: any) => {
            visit(tree, 'element', (node, index, parent) => {
                if ((node as any).tagName === 'img') {
                    const alt = (node as any).properties?.alt as string;
                    const src = (node as any).properties?.src as string;
                    if (alt && src) {
                        const figureNode = {
                            type: 'element',
                            tagName: 'figure',
                            properties: {},
                            children: [
                                {
                                    type: 'element',
                                    tagName: 'img',
                                    properties: { src: `/images/${src}`, alt },
                                    children: [],
                                },
                                {
                                    type: 'element',
                                    tagName: 'figcaption',
                                    properties: {},
                                    children: [{ type: 'text', value: alt }],
                                },
                            ],
                        };
                        if (parent && typeof index === 'number') {
                            parent.children[index] = figureNode;
                        }
                        return [(visit as any).SKIP];
                    }
                }
            });
        })
        .use(rehypeStringify);
    const htmlString = await processor.process(markdownContent).then((result) => result.toString());
    return htmlString;
}