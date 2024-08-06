import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPost, getPostByPostId, getTagCounts, getTagsByPostId } from "~/modules/db.server";
import { generateFileName, putFileToStorage } from "~/modules/storage.server";
import { IconType } from 'react-icons';
import { FaHeading, FaBold, FaItalic, FaLink, FaListUl, FaListOl, FaStrikethrough, FaImage, } from 'react-icons/fa';
import { RenderMarkdownIntoHTML } from "~/Components/RenderMarkdownIntoHTML";


interface ToolbarItem {
  label: string;
  icon: IconType;
  action: () => void;
}

export async function loader({ context, request }: LoaderFunctionArgs) {
    const tagCounts = await getTagCounts(context);
    const url = new URL(request.url);
    const postId = url.searchParams.get("postId");
    if (postId) {
        const post = await getPostByPostId(Number(postId), context, true);
        const tagNames = await getTagsByPostId(Number(postId), context);
        return json({ post, tagCounts, tagNames, postId });
    }
    return json({ post: null, tagCounts, tagNames: [], postId: null });
}

export default function EditNew() {
    const { post, postId, tagCounts, tagNames } = useLoaderData<typeof loader>();

    const [markdownContent, setMarkdownContent] = useState(post?.postContentMD ?? "");
    const [postTitle, setPostTitle] = useState(post?.postTitle ?? "");
    const [summary, setSummary] = useState(post?.postSummary ?? "");
    const [tags, setTags] = useState(tagNames.map(tag => tag && tag.tagName).join(" ") ?? "");
    const [isPublic, setIsPublic] = useState(post?.isPublic === 1);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    const submit = useSubmit();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedMarkdownContent = localStorage.getItem('markdownContent');
        // postIdに値がある場合＝既存の記事を編集する場合＝stateで初期化した値をそのまま使用する
        // postIdに値がない場合＝新規投稿する場合＝localStorageの値を使用する
        if (savedMarkdownContent && !postId) setMarkdownContent(savedMarkdownContent);

        const savedPostTitle = localStorage.getItem('postTitle');
        if (savedPostTitle && !postId) setPostTitle(savedPostTitle);

        const savedSummary = localStorage.getItem('summary');
        if (savedSummary && !postId) setSummary(savedSummary);

        const savedTags = localStorage.getItem('tags');
        if (savedTags && !postId) setTags(savedTags);

        const savedIsPublic = localStorage.getItem('isPublic');
        if (savedIsPublic && !postId) setIsPublic(savedIsPublic === 'true');
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
        formData.append("postId", postId ?? "");
        submit(formData, {
            method: "post"
        });
    };

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

    const generateTagSuggestions = useCallback((input: string) => {
        if (!input.trim()) {
            setSuggestedTags([]);
            return;
        }
        const inputTags = input.split(' ').filter(tag => tag.trim() !== '');
        const lastTag = inputTags[inputTags.length - 1].toLowerCase().replace(/^#/, '');
        
        if (!lastTag) {
            setSuggestedTags([]);
            return;
        }

        const suggestions = tagCounts
            .filter(tag => tag.tagName.toLowerCase().includes(lastTag))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(tag => `${tag.tagName}（${tag.count}）`);
        setSuggestedTags(suggestions);
    }, [tagCounts]);

    const handleTagsChange = useCallback((value: string) => {
        setTags(value);
        localStorage.setItem('tags', value);
        generateTagSuggestions(value);
    }, [generateTagSuggestions]);

    const handleTagSuggestionClick = useCallback((suggestion: string) => {
        setTags(prevTags => {
            const tagArray = prevTags.split(' ').filter(tag => tag !== '');
            tagArray.pop(); // 最後の未完成のタグを削除
            const newTag = suggestion.split('（')[0]; // カウント部分を除去
            const newTags = [...tagArray, `#${newTag}`].join(' ') + ' ';
            localStorage.setItem('tags', newTags);
            return newTags;
        });
        setSuggestedTags([]);
    }, []);

    return (
        <Form encType="multipart/form-data">
            <div>
                <textarea
                    name="postTitle"
                    placeholder="タイトル"
                    className="textarea textarea-bordered w-full my-4"
                    value={postTitle}
                    onChange={(e) => handlePostTitleChange(e.target.value)}
                />
            </div>
            <div>
                <textarea
                    name="summary"
                    placeholder="サマリー"
                    className="textarea textarea-bordered w-full my-4"
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
                <RenderMarkdownIntoHTML markdownContent={markdownContent} />
            </div>
            </div>
            <div className="my-4">
                <div className="form-control">
                    <label className="label cursor-pointer">
                        <div className="flex items-center space-x-2">
                            <span className="label-text">公開</span>
                            <input type="checkbox" className="toggle toggle-primary " checked={isPublic} onChange={() => handleIsPublicChange(!isPublic)} />
                        </div>
                    </label>
                </div>
            </div>
            <div className="relative">
                <textarea
                    name="tags"
                    placeholder="タグを入力  #生活 #人生"
                    className="textarea textarea-bordered w-full my-4 placeholer-slate-500"
                    value={tags}
                    onChange={(e) => handleTagsChange(e.target.value)}
                />
                {suggestedTags.length > 0 && (
                    <div className="absolute z-10 w-full bg-base-100 shadow-lg rounded-md mt-1">
                        {suggestedTags.map((suggestion, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-base-200 cursor-pointer"
                                onClick={() => handleTagSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
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
        const postId = formData.get("postId") as string;
        const post = await createPost(postTitle, markdownContent, tags, isPublic, summary, Number(postId), context);
        if (!post) {
            return json({ error: "Failed to create post", status: 500 });
        }
        const newPostUrl = `/posts/${post.postId}`;
        return json({ message: "Created", newPostUrl, status: 200 });
    } else if (actionType === "uploadMedia"){
        const file = formData.get("file") as File;
        const fileName = await generateFileName();
        const key = await putFileToStorage(context, fileName, file);
        return json({ message: "Uploaded", uploadedFileKey: key, status: 200 });
    }
}