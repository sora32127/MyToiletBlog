import { PostShowCardSchema } from "~/modules/db.server";
import { z } from "zod";
import { H3 } from "./Headings";
import { NavLink } from "@remix-run/react";
import TagShowCard from "./TagShowCard";

export function PostShowCard({ post }: { post: z.infer<typeof PostShowCardSchema> }) {
    const postDate = new Date(post.postUnixTimeGMT * 1000);
    const postUrl = `/posts/${post.postId}`;

    return (
        <div className="border border-y-2  rounded-lg p-4">
            <div className="text-sm text-base-500">{postDate.toLocaleDateString()}</div>
            <NavLink to={postUrl}>
                <H3>{post.postTitle}</H3>
            </NavLink>
            <div>
                {post.tagsNames.map((tag) => (
                    <TagShowCard key={tag.tagId} tags={tag} />
                ))}
            </div>
            <div>{post.postSummary}</div>
        </div>      
    );
}
