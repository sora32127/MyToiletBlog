import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
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
            {posts.map((post) => (
                <PostShowCard post={post} key={post.postId} />
            ))}
        </div>
    );
}

export const meta: MetaFunction = () => {
    const title = "現実モデリング";
    const description = "contradiction29の個人ブログだよ";
    const defaultOGImageURL = "https://x.com/contradiction29/photo"
    return [
      { title },
      { description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:locale", content: "ja_JP" },
      { property: "og:site_name", content: "現実モデリング" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://contradictionononline.com" },
      { property: "og:image", content: defaultOGImageURL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "https://x.com/contradiction29" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:creator", content: "https://x.com/contradiction29" },
      { name: "twitter:image", content: defaultOGImageURL },
    ];
  };