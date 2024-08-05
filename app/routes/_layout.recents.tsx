import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { H1 } from "~/Components/Headings";
import { PostShowCard } from "~/Components/PostShowCard";
import { getRecentPosts } from "~/modules/db.server";

export async function loader({ context }: LoaderFunctionArgs) {
    const posts = await getRecentPosts(context);
    return json({ posts });
}

export default function Recents() {
    const { posts } = useLoaderData<typeof loader>();
    return (
        <div>
            <H1>Recent Posts</H1>
            <ul>
                {posts.map((post) => (
                    <li key={post.postId}>
                        <PostShowCard post={post} key={post.postId} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
