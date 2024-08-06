import { tagSchema } from "~/modules/db.server";
import { z } from "zod";
import { NavLink } from "@remix-run/react";

export default function TagShowCard({tags}: {tags: z.infer<typeof tagSchema>}) {
    return (
        <div key={tags.tagId} className="badge badge-lg outline m-2 p-2 py-4">
            <NavLink to={`/tags/${tags.tagName}`}>
                #{tags.tagName}
            </NavLink>
        </div>
    );
}