import { unified } from 'unified';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';
import rehypeHighlight from 'rehype-highlight';
import type { Node, Parent } from 'unist';
import type { Element } from 'hast';

interface ImageNode extends Element {
    tagName: 'img';
    properties: {
        alt?: string;
        src?: string;
    };
}

export async function renderMarkdownIntoHTML(markdownContent: string) {
    const processor = unified()
        .use(markdown)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight, {
            detect: true,
        })
        .use(() => (tree: Node) => {
            visit(tree, 'element', (node: Element, index: number | null, parent: Parent | null) => {
                if (node.tagName === 'img') {
                    const imgNode = node as ImageNode;
                    const alt = imgNode.properties?.alt;
                    const src = imgNode.properties?.src;
                    if (alt && src) {
                        const figureNode: Element = {
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
                        // @ts-ignore
                        return [visit.SKIP];
                    }
                }
            });
        })
        .use(rehypeStringify);
    const result = await processor.process(markdownContent);
    return result.toString();
}