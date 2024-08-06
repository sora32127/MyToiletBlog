import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { Form, useActionData, useBlocker, useSubmit } from "@remix-run/react";
import { marked } from "marked";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPost } from "~/modules/db.server";
import { generateFileName, putFileToStorage } from "~/modules/storage.server";
import { IconType } from 'react-icons';
import { FaHeading, FaBold, FaItalic, FaLink, FaListUl, FaListOl, FaStrikethrough, FaImage, } from 'react-icons/fa';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import markdown from 'remark-parse';
import { visit } from 'unist-util-visit';


interface ToolbarItem {
  label: string;
  icon: IconType;
  action: () => void;
}

export default function EditNew() {
    const [markdownContent, setMarkdownContent] = useState("");
    const [postTitle, setPostTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [tags, setTags] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    const submit = useSubmit();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedMarkdownContent = localStorage.getItem('markdownContent');
        if (savedMarkdownContent) setMarkdownContent(savedMarkdownContent);

        const savedPostTitle = localStorage.getItem('postTitle');
        if (savedPostTitle) setPostTitle(savedPostTitle);

        const savedSummary = localStorage.getItem('summary');
        if (savedSummary) setSummary(savedSummary);

        const savedTags = localStorage.getItem('tags');
        if (savedTags) setTags(savedTags);

        const savedIsPublic = localStorage.getItem('isPublic');
        if (savedIsPublic) setIsPublic(savedIsPublic === 'true');
    }, []);

    const handleMarkdownContentChange = useCallback((value: string) => {
        setMarkdownContent(value);
        localStorage.setItem('markdownContent', value);
    }, []);

    const handlePostTitleChange = useCallback((value: string) => {
        setPostTitle(value);
        localStorage.setItem('postTitle', value);
    }, []);

    const handleSummaryChange = useCallback((value: string) => {
        setSummary(value);
        localStorage.setItem('summary', value);
    }, []);

    const handleTagsChange = useCallback((value: string) => {
        setTags(value);
        localStorage.setItem('tags', value);
    }, []);

    const handleIsPublicChange = useCallback((value: boolean) => {
        setIsPublic(value);
        localStorage.setItem('isPublic', value.toString());
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("markdownContent", markdownContent);
        formData.append("postTitle", postTitle);
        formData.append("summary", summary);
        formData.append("tags", tags);
        formData.append("isPublic", isPublic.toString());
        formData.append("actionType", "createPost");
        console.log(markdownContent, postTitle, summary, tags, isPublic);
        submit(formData, {
            method: "post"
        });
    };

    const [htmlContent, setHtmlContent] = useState("");
    const renderMarkdownIntoHTML = useCallback(async (markdownContent: string) => {
        const processor = await unified()
            .use(markdown)
            .use(remarkGfm)
            .use(remarkRehype)
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
    }, []);

    useEffect(() => {
        renderMarkdownIntoHTML(markdownContent).then(setHtmlContent);
    }, [markdownContent, renderMarkdownIntoHTML]);

    const insertMarkdown = useCallback((prefix: string, suffix: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const newText = `${markdownContent.slice(0, selectionStart)}${prefix}${markdownContent.slice(selectionStart, selectionEnd)}${suffix}${markdownContent.slice(selectionEnd)}`;

        setMarkdownContent(newText);
        textarea.focus();
        textarea.setSelectionRange(selectionStart + prefix.length, selectionEnd + prefix.length);
    }, [markdownContent]);

    const toolbarItems: ToolbarItem[] = [
        { label: '見出し1', icon: FaHeading, action: () => insertMarkdown('# ') },
        { label: '太字', icon: FaBold, action: () => insertMarkdown('**', '**') },
        { label: '斜体', icon: FaItalic, action: () => insertMarkdown('*', '*') },
        { label: '打ち消し線', icon: FaStrikethrough, action: () => insertMarkdown('~~', '~~') },
        { label: 'リンク', icon: FaLink, action: () => insertMarkdown('[', '](url)') },
        { label: '箇条書き', icon: FaListUl, action: () => insertMarkdown('- ') },
        { label: '番号付きリスト', icon: FaListOl, action: () => insertMarkdown('1. ') },
        { label: '画像', icon: FaImage, action: () => fileInputRef.current?.click() },
    ];

    const renderToolbarButton = (item: ToolbarItem, index: number) => (
        <div key={index} className="tooltip" data-tip={item.label}>
            <button onClick={item.action} type="button" className="btn btn-sm btn-ghost">
                <item.icon />
            </button>
        </div>
    );

    const actionData = useActionData<typeof action>();
    const uploadedFileKey = actionData?.uploadedFileKey ?? "";
    useEffect(() => {
        if (uploadedFileKey) {
          setMarkdownContent((prevContent) => prevContent + `\n![Uploaded Image](${uploadedFileKey})`);
        }
    }, [uploadedFileKey]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("actionType", "uploadMedia");
            submit(formData, { method: "POST", encType: "multipart/form-data" });
        }
    }, [submit]);

    return (
        <Form encType="multipart/form-data">
            <div>
                <input
                    type="text"
                    name="postTitle"
                    placeholder="タイトル"
                    className="input input-bordered input-primary w-full my-4"
                    value={postTitle}
                    onChange={(e) => handlePostTitleChange(e.target.value)}
                />
            </div>
            <div>
                <input
                    type="text"
                    name="summary"
                    placeholder="サマリー"
                    className="input input-bordered input-primary w-full my-4 h-24"
                    value={summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                />
            </div>
            <div className="my-4">
                <div className="card w-full bg-base-100 border">
                    <div className="card-body">
                        <div className="flex flex-wrap items-center space-x-2 mb-4">
                            {toolbarItems.map(renderToolbarButton)}
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={markdownContent}
                            onChange={(e) => handleMarkdownContentChange(e.target.value)}
                            className="textarea textarea-bordered w-full min-h-[32rem] markdownEditor"
                        />
                        <input
                            type="file"
                            name="file"
                            ref={fileInputRef}
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </div>
            <div className="my-4">
            <div className="my-4">
                <div dangerouslySetInnerHTML={{ __html: htmlContent }} className="markdownEditorPreview"></div>
            </div>
            </div>
            <div className="my-4">
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <span className="label-text">公開</span>
                        <input type="radio" name="radio-ispublic" className="radio checked:bg-red-500" value="true" onChange={(e) => handleIsPublicChange(e.target.value === "true")} />
                    </label>
                </div>
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <span className="label-text">下書き</span>
                        <input type="radio" name="radio-ispublic" className="radio checked:bg-blue-500" value="false" onChange={(e) => handleIsPublicChange(e.target.value === "false")} defaultChecked />
                    </label>
                </div>
            </div>
            <div>
                <input type="text" name="tags" placeholder="タグを入力  #生活 #人生" className="input input-bordered input-primary w-full my-4" value={tags} onChange={(e) => handleTagsChange(e.target.value)} />
            </div>
            <div className="my-4">
                <button className="btn btn-primary w-full" type="submit" onClick={(e) => handleSubmit(e)}>保存</button>
            </div>
        </Form>
    );
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    console.log("AAAA");
    const actionType = formData.get("actionType") as string;
    if (actionType === "createPost"){
        console.log("create")
        const markdownContent = formData.get("markdownContent") as string;
        const postTitle = formData.get("postTitle") as string;
        const summary = formData.get("summary") as string;
        const tags = formData.get("tags") as string;
        const isPublic = formData.get("isPublic") as string;
        console.log(postTitle, markdownContent);
        if (!postTitle || !markdownContent) {
            return json({ error: "Invalid form data",status: 400, uploadedFileKey: "" });
        }
    
        const post = await createPost(postTitle, markdownContent, tags, isPublic, summary, context);
        const newPostUrl = `/posts/${post.postId}`;
        return redirect(newPostUrl);
    } else if (actionType === "uploadMedia"){
        const file = formData.get("file") as File;
        const fileName = await generateFileName();
        const key = await putFileToStorage(context, fileName, file);
        return json({ message: "Uploaded", uploadedFileKey: key, status: 200 });
    }
}