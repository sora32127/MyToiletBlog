import { postSchema } from "~/modules/db.server";
import { z } from "zod";
import { H3 } from "./Headings";
import { NavLink } from "@remix-run/react";

export function PostShowCard({ post }: { post: z.infer<typeof postSchema> }) {
    const postDate = new Date(post.postUnixTimeGMT * 1000);
    const postUrl = `/posts/${post.postId}`;

    return (
        <NavLink to={postUrl}>
            <div className="border border-y-2  rounded-lg p-4">
                <H3>{post.postTitle}</H3>
            <div className="text-sm text-base-500">{postDate.toLocaleDateString()}</div>
                <div>{post.postContentMD}</div>
            </div>
        </NavLink>
    );
}
