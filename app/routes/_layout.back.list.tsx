import { json } from "@remix-run/cloudflare";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { Modal } from "~/Components/Modal";
import { PostEditCard } from "~/Components/PostEditCard";
import { deletePosts, getPostsInBackList } from "~/modules/db.server";

import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const posts = await getPostsInBackList(context);
    return json({ posts });
}

export default function BackList() {
    const { posts } = useLoaderData<typeof loader>();
    const [isPostDeleteModalOpen, setIsPostDeleteModalOpen] = useState(false);
    const [selectedPostIds, setSelectedPostIds] = useState<number[]>([]);
    const submit = useSubmit();
    
    const handlePostDelete = () => {
        const formData = new FormData();
        formData.append("postId", selectedPostIds.join(","));
        submit(formData, {
            method: "post",
            action: "/back/list",
        });
        setSelectedPostIds([]);
    }

    const handlePostSelect = (postId: number) => {
        setSelectedPostIds((prevSelectedPostIds) => {
            if (prevSelectedPostIds.includes(postId)) {
                return prevSelectedPostIds.filter((id) => id !== postId);
            }
            return [...prevSelectedPostIds, postId];
        });
    }

    return (
        <div>
            <h1>BackList</h1>
            <button className="btn btn-primary" onClick={() => setIsPostDeleteModalOpen(true)} type="button">選択した投稿を削除する({selectedPostIds.length}件)</button>
            <ul>
                {posts.map((post) => (
                    <PostEditCard key={post.postId} post={post} handlePostSelect={handlePostSelect} />
                ))}
            </ul>
            <Modal
                isOpen={isPostDeleteModalOpen}
                onClose={() => setIsPostDeleteModalOpen(false)}
                title="削除確認"
                showCloseButton={false}
            >
                <p>削除しますか？</p>
                <button className="btn btn-primary" onClick={() => setIsPostDeleteModalOpen(false)} type="button">いいえ</button>
                <button className="btn btn-warning" onClick={() =>{ setIsPostDeleteModalOpen(false); handlePostDelete(); }} type="button">はい</button>
            </Modal>
        </div>
    );
}

export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const postIds = formData.get("postId") as string;
    const postIdArray = postIds.split(",").map((postId) => Number.parseInt(postId));
    await deletePosts(postIdArray, context);
    return json({ status: 200 });
}

