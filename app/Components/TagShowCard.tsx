import { tagSchema } from "~/modules/db.server";
import { z } from "zod";
import { NavLink } from "@remix-run/react";
import { FaTag } from "react-icons/fa";

export default function TagShowCard({tags}: {tags: z.infer<typeof tagSchema>}) {
    return (
        <NavLink 
            to={`/recents?tagName=${tags.tagName}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary transition-colors duration-200 text-white"
        >
            <FaTag className="mr-1" />
            {tags.tagName}
        </NavLink>
    );
}