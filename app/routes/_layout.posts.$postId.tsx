import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getPost } from "~/modules/db.server";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const postId = params.postId;
    const post = await getPost(Number(postId), context);
    return json({ post });
}

export default function Post() {
    const { post } = useLoaderData<typeof loader>();
    return (
        <div>
            <div>{post.postTitle}</div>
            <div>{post.postContentMD}</div>
        </div>
    );
}