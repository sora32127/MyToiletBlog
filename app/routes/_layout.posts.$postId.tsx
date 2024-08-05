import { json, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { H1 } from "~/Components/Headings";
import { getPostByPostId } from "~/modules/db.server";
import { marked } from "marked";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const postId = params.postId;
    const post = await getPostByPostId(Number(postId), context);
    return json({ post });
}

export default function Post() {
    const { post } = useLoaderData<typeof loader>();
    return (
        <div>
            <H1>{post.postTitle}</H1>
            <div dangerouslySetInnerHTML={{ __html: marked(post.postContentMD) }} />
        </div>
    );
}