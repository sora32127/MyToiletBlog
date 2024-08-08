import { json } from "@remix-run/cloudflare";
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { createPost, getPostByPostId, getTagCounts, getTagsByPostId } from "~/modules/db.server";
import { generateFileName, putFileToStorage } from "~/modules/storage.server";
import { FaHeading, FaBold, FaItalic, FaLink, FaListUl, FaListOl, FaStrikethrough, FaImage, } from 'react-icons/fa';
import { RenderMarkdownIntoHTML } from "~/Components/RenderMarkdownIntoHTML";
import { Modal } from "~/Components/Modal";
import { TagInput } from "~/Components/TagInput";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/cloudflare";
import type { IconType } from "react-icons";

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
    const [tags, setTags] = useState(tagNames.map(tag => tag && `#${tag.tagName}`).join(" ") ?? "");
    const [isPublic, setIsPublic] = useState(post?.isPublic === 1);
    const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

    const submit = useSubmit();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedMarkdownContent = localStorage.getItem('markdownContent');
        // postIdに値がある場合＝既存の記事を編集する場合＝stateで初期化した値をそのまま使用する
        // postIdに値がない場合＝新規投稿する場合＝localStorageの値を使用する
        if (!postId) {
            const savedPostTitle = localStorage.getItem('postTitle');
            const savedSummary = localStorage.getItem('summary');
            const savedTags = localStorage.getItem('tags');
            const savedIsPublic = localStorage.getItem('isPublic');
            setMarkdownContent(savedMarkdownContent ?? "");
            setPostTitle(savedPostTitle ?? "");
            setSummary(savedSummary ?? "");
            setTags(savedTags ?? "");
            setIsPublic(savedIsPublic === 'true');  
        }
    }, [postId]);

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

    const insertMarkdown = useCallback((prefix: string, suffix = '') => {
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

    const clearLocalStorage = useCallback(() => {
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
    }, []);

    useEffect(() => {
        if (actionData) {
            console.log(actionData);
            if (actionData.status === 200) {
                clearLocalStorage();
                setIsSuccessModalOpen(true);
                const timer = setTimeout(() => {
                    navigate(actionData.newPostUrl);
                }, 1000);
                return () => clearTimeout(timer);
            // biome-ignore lint/style/noUselessElse: <explanation>
            } else if (actionData.status !== 201) {      
                setIsErrorModalOpen(true);
                setErrorMessage(actionData.message ?? "Unknown error");
            }
        }
    }, [actionData, navigate, clearLocalStorage]);

    const uploadedFileKey = actionData?.uploadedFileKey ?? "";
    useEffect(() => {
        if (uploadedFileKey) {
          setMarkdownContent((prevContent) => `${prevContent}\n![Uploaded Image](${uploadedFileKey})`);
        }
    }, [uploadedFileKey]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            event.preventDefault();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("actionType", "uploadMedia");
            submit(formData, { method: "POST", encType: "multipart/form-data" });
        }
    }, [submit]);

    const handleTagsChange = useCallback((value: string) => {
        setTags(value);
        localStorage.setItem('tags', value);
    }, []);

    return (
        <Form encType="multipart/form-data" onSubmit={(e) => handleSubmit(e)}>
            <button
                className="btn btn-primary"
                onClick={() => setIsDangerModalOpen(true)}
                type="button"
            >
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
                    }} type="button">はい</button>
                    <button className="btn" onClick={() => setIsDangerModalOpen(false)} type="button">いいえ</button>
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
        if (!postTitle || !markdownContent) {
            return json({ 
                message: "Invalid form data",
                status: 400,
                uploadedFileKey: "",
                newPostUrl: ""
            });
        }
        const postId = formData.get("postId") as string;
        const post = await createPost(postTitle, markdownContent, tags, isPublic, summary, context, Number(postId));
        if (post && post.status !== 200) {
            return json({
                message: post.message,
                status: post.status,
                uploadedFileKey: "",
                newPostUrl: ""
            });
        }
        // isPublic = 1かつpostがある場合は、postのURLを返す
        // isPublic = 0かつpostがある場合は、back/listにリダイレクトする
        // postがない場合はエラーメッセージを返す
        const newPostUrl = isPublic === "1" && post ? `/posts/${post.postId}` : "/back/list";
        return json({
            message: "SuccessFully Created",
            newPostUrl,
            status: 200,
            uploadedFileKey: "",
            postId: post?.postId
        });
    } 
    const file = formData.get("file") as File;
    const fileName = await generateFileName();
    const key = await putFileToStorage(context, fileName, file);
    return json({
        message: "Successfully uploaded",
        uploadedFileKey: key,
        status: 201,
        newPostUrl: ""
    });
}