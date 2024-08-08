import type { PostShowCardSchemaType } from "~/modules/db.server";
import { H3 } from "./Headings";
import { NavLink } from "@remix-run/react";
import TagShowCard from "./TagShowCard";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";
import DateTime from "./DateTime";

export function PostShowCard({ post }: { post: PostShowCardSchemaType }) {
    if (!post) {
        return null;
    }
    const postUrl = `/posts/${post.postId}`;

    return (
        <div className="bg-base-200 rounded-lg p-4 transition-all duration-300 hover:shadow-xl my-4">
            <div className="flex flex-wrap gap-2 mb-3">
                {post.tagsNames.map((tag) => (
                    <TagShowCard key={tag.tagId} tags={tag} />
                ))}
            </div>
            <div className="flex items-center text-sm mb-2">
                <FaCalendarAlt className="mr-2" />
                <DateTime unixtime={post.postUnixTimeGMT} />
            </div>
            <NavLink to={postUrl} className="group">
                <H3>
                    {post.postTitle}
                </H3>
            </NavLink>
            <p className="mb-4">{post.postSummary}</p>
            <NavLink to={postUrl} className="inline-flex items-center text-info">
                続きを読む
                <FaChevronRight className="ml-1" />
            </NavLink>
        </div>      
    );
}