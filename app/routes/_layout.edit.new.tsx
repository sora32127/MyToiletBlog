import { ActionFunctionArgs, json, redirect } from "@remix-run/cloudflare";
import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import { MarkdownEditor } from "~/Components/MarkdownEditor";
import { createPost } from "~/modules/db.server";

export default function EditNew() {
    const [markdownContent, setMarkdownContent] = useState("");
    const [postTitle, setPostTitle] = useState("");
    const submit = useSubmit();
    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append("markdownContent", markdownContent);
        formData.append("postTitle", postTitle);
        submit(formData, {
            method: "POST",
            action: "/edit/new",
        });
    };
    return (
        <div>
            <input type="text" name="postTitle" placeholder="タイトル" className="input input-bordered input-primary w-full max-w-xs" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
            <MarkdownEditor value={markdownContent} onChange={setMarkdownContent} />
            <button className="btn btn-primary" onClick={handleSubmit}>保存</button>
        </div>
    );
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const markdownContent = formData.get("markdownContent") as string;
    const postTitle = formData.get("postTitle") as string;
    console.log(postTitle, markdownContent);
    if (!postTitle || !markdownContent) {
        return json({ error: "Invalid form data" }, { status: 400 });
    }

    const post = await createPost(postTitle, markdownContent, context);
    const newPostUrl = `/edit/${post.postId}`;
    return redirect(newPostUrl);
}