import type { PostShowCardSchemaType } from "~/modules/db.server";
import { H3 } from "./Headings";
import { NavLink } from "@remix-run/react";
import TagShowCard from "./TagShowCard";
import { FaCalendarAlt, FaChevronRight } from "react-icons/fa";

export function PostEditCard({ post, handlePostSelect }: { post: PostShowCardSchemaType, handlePostSelect: (postId: number) => void }) {
    if (!post) {
        return null;
    }
    const postDate = new Date(post.postUnixTimeGMT * 1000);
    const postEditUrl = `/back/edit?postId=${post.postId}`;


    return (
        <div className="bg-base-200 rounded-lg p-6 transition-all duration-300 hover:shadow-xl my-4">
            <input type="checkbox" className="checkbox" onChange={() => handlePostSelect(post.postId)} />
            <div className="flex flex-wrap gap-2 mb-3">
                {post.tagsNames.map((tag) => (
                    <TagShowCard key={tag.tagId} tags={tag} />
                ))}
            </div>
            <div className="flex items-center text-sm mb-2">
                <FaCalendarAlt className="mr-2" />
                {postDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <NavLink to={postEditUrl} className="group">
                <H3>
                    {post.postTitle}
                </H3>
            </NavLink>
            <p className="mb-4">{post.postSummary}</p>
            <NavLink to={postEditUrl} className="inline-flex items-center text-info">
                編集する
                <FaChevronRight className="ml-1" />
            </NavLink>
        </div>      
    );
}