import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { PostEditCard } from "~/Components/PostEditCard";
import { getPostByPostId, getPostsInBackList } from "~/modules/db.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const posts = await getPostsInBackList(context);
    return json({ posts });
}

export default function BackList() {
    const { posts } = useLoaderData<typeof loader>();
    return (
        <div>
            <h1>BackList</h1>
            <ul>
                {posts.map((post) => (
                    <PostEditCard key={post.postId} post={post} />
                ))}
            </ul>
        </div>
    );
}

