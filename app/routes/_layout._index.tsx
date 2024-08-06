import { json, LoaderFunctionArgs, type MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { PostShowCard } from "~/Components/PostShowCard";
import { getRecentPosts } from "~/modules/db.server";

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

export async function loader({ context }: LoaderFunctionArgs) {
  const recents = await getRecentPosts(context);
  return json({ recents });
}

export default function Index() {
  const { recents } = useLoaderData<typeof loader>();
  
  return (
    <div>
        <ul>
          {recents.map((post) => (
            <PostShowCard key={post.postId} post={post} />
          ))}
        </ul>
    </div>
  );
}