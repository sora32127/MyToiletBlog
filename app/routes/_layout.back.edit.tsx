import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPost, getPostByPostId, getTagCounts, getTagsByPostId } from "~/modules/db.server";
import { generateFileName, putFileToStorage } from "~/modules/storage.server";
import { IconType } from 'react-icons';
import { FaHeading, FaBold, FaItalic, FaLink, FaListUl, FaListOl, FaStrikethrough, FaImage, } from 'react-icons/fa';
import { RenderMarkdownIntoHTML } from "~/Components/RenderMarkdownIntoHTML";
import { Modal } from "~/Components/Modal";
import { TagInput } from "~/Components/TagInput";

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

const createFormData = (
    markdownContent: string,
    postTitle: string,
    summary: string,
    tags: string,
    isPublic: boolean,
    postId: string | null
) => {
    const formData = new FormData();
    formData.append("markdownContent", markdownContent);
    formData.append("postTitle", postTitle);
    formData.append("summary", summary);
    formData.append("tags", tags);
    formData.append("isPublic", isPublic.toString());
    formData.append("actionType", "createPost");
    formData.append("postId", postId ?? "");
    return formData;
};

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = createFormData(markdownContent, postTitle, summary, tags, isPublic, postId);
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
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const navigate = useNavigate();

    const clearLocalStorage = () => {
        localStorage.removeItem('markdownContent');
        localStorage.removeItem('postTitle');
        localStorage.removeItem('summary');
        localStorage.removeItem('tags');
        localStorage.removeItem('isPublic');
        setMarkdownContent("");
        setPostTitle("");
        setSummary("");
        setTags("");
        setIsPublic(false);
    }

    useEffect(() => {
        if (actionData?.status === 200) {
            setIsSuccessModalOpen(true);
            const timer = setTimeout(() => {
                navigate(actionData.newPostUrl);
                clearLocalStorage();
            }, 1000);
            return () => clearTimeout(timer);
        } else if (actionData?.status === 400) {
            setIsErrorModalOpen(true);
            setErrorMessage(actionData.message);
        }
    }, [actionData, navigate]);

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
        <Form encType="multipart/form-data" onSubmit={(e) => handleSubmit(e)}>
            <button
                className="btn btn-primary"
                onClick={() => setIsDangerModalOpen(true)}>
                入力データを削除
            </button>
            <Modal
                isOpen={isDangerModalOpen}
                onClose={() => setIsDangerModalOpen(false)}
                title="入力データを削除"
                showCloseButton={false}
            >
                <p>入力データを削除しますか？</p>
                <div className="modal-action">
                    <button className="btn btn-warning"
                    onClick={() =>{
                        clearLocalStorage();
                        setIsDangerModalOpen(false);
                    }}>はい</button>
                    <button className="btn" onClick={() => setIsDangerModalOpen(false)}>いいえ</button>
                </div>
            </Modal>
            <div className="space-y-6 my-6">
                <div>
                    <label htmlFor="postTitle" className="block text-sm font-medium text-base-content mb-2">タイトル</label>
                    <textarea
                        id="postTitle"
                        name="postTitle"
                        placeholder="タイトルを入力してください"
                        className="textarea textarea-bordered w-full"
                        value={postTitle}
                        onChange={(e) => handlePostTitleChange(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="summary" className="block text-sm font-medium text-base-content mb-2">サマリー</label>
                    <textarea
                        id="summary"
                        name="summary"
                        placeholder="記事の要約を入力してください"
                        className="textarea textarea-bordered w-full"
                        value={summary}
                        onChange={(e) => handleSummaryChange(e.target.value)}
                    />
                </div>
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
                        <span className="label-text">公開</span>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isPublic}
                            onChange={() => handleIsPublicChange(!isPublic)}
                            onKeyDown={(e) => {
                                e.preventDefault();
                                if (e.key === 'Enter') {
                                    handleIsPublicChange(!isPublic);
                                }
                            }}
                        />
                    </label>
                </div>
            </div>
            <TagInput
                tags={tags}
                onTagsChange={handleTagsChange}
                tagCounts={tagCounts}
            />
            
            <div className="my-4">
                <button className="btn btn-primary w-full" type="submit">保存</button>
            </div>
            <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="成功" showCloseButton={false}>
                <p>記事を保存しました。リダイレクトします。</p>
            </Modal>
            <Modal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} title="エラー" showCloseButton={false}>
                <p>記事の保存に失敗しました</p>
                <p>{errorMessage}</p>
            </Modal>
        </Form>
    );
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as string;
    if (actionType === "createPost"){
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
        if (post && post.status !== 200) {
            return json({ message: post.message, status: post.status });
        } else if (!post){
            return json({ message: "Failed to create post", status: 500 });
        } else {
            const newPostUrl = `/posts/${post.post.postId}`;
            return json({ message: "Created", newPostUrl, status: 200 });
        }
    } else if (actionType === "uploadMedia"){
        const file = formData.get("file") as File;
        const fileName = await generateFileName();
        const key = await putFileToStorage(context, fileName, file);
        return json({ message: "Uploaded", uploadedFileKey: key, status: 200 });
    }
}