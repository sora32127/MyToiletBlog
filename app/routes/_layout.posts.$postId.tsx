import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { H1 } from "~/Components/Headings";
import { getPostByPostId, getTagsByPostId } from "~/modules/db.server";
import { marked } from "marked";
import TagShowCard from "~/Components/TagShowCard";
import SummaryShowCard from "~/Components/SummaryShowCard";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const postId = params.postId;
    const post = await getPostByPostId(Number(postId), context);
    const tags = await getTagsByPostId(Number(postId), context);
    return json({ post, tags });
}

export default function Post() {
    const { post, tags } = useLoaderData<typeof loader>();
    if (!post) {
        return <div>Post not found</div>;
    }
    const postSummary = post.postSummary;
    return (
        <div>
            <H1>{post.postTitle}</H1>
            <div>
                <SummaryShowCard postSummary={postSummary.toString()} />
            </div>
            <div>
                {tags && tags.map((tag) => (
                    <TagShowCard key={tag.tagId} tags={tag} />
                ))}
            </div>
            <div dangerouslySetInnerHTML={{ __html: marked(post.postContentMD) }} />
        </div>
    );
}