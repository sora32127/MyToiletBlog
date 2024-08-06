import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { H1, H2 } from "~/Components/Headings";
import { PostShowCard } from "~/Components/PostShowCard";
import { getPostsByTagName, getRecentPosts } from "~/modules/db.server";

export async function loader({ context, request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const tagName = url.searchParams.get("tagName");
    const posts = tagName ? await getPostsByTagName(tagName, context) : await getRecentPosts(context);

    return json({ posts, tagName });
}

export default function Recents() {
    const { posts, tagName } = useLoaderData<typeof loader>();
    return (
        <div>
            <H1>Recent Posts</H1>
            {tagName && <H2>タグ: {tagName}</H2>}
            <ul>
                {posts.map((post) => (
                    <PostShowCard post={post} key={post.postId} />
                ))}
            </ul>
        </div>
    );
}
