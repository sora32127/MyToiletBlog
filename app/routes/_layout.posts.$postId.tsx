import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { H1 } from "~/Components/Headings";
import { getPostByPostId, getTagsByPostId } from "~/modules/db.server";
import TagShowCard from "~/Components/TagShowCard";
import SummaryShowCard from "~/Components/SummaryShowCard";
import ShareButtons from "~/Components/ShareButtons";
import { renderMarkdownIntoHTML } from "~/modules/rendermarkdown.server";
import DateTime from "~/Components/DateTime";

export async function loader({ params, context }: LoaderFunctionArgs) {
    const postId = params.postId;
    const post = await getPostByPostId(Number(postId), context, false)
    if (!post) {
        return json({
            message: "Post not found",
            status: 404,
            post: null,
            tags: null,
            postHTML: null
        });
    }
    const tags = await getTagsByPostId(Number(postId), context);
    const postHTML = await renderMarkdownIntoHTML(post.postContentMD.toString())
    return json({ post, tags, postHTML });
}

export default function Post() {
    const { post, tags, postHTML } = useLoaderData<typeof loader>();
    if (!post) {
        return <div>Post not found</div>;
    }
    const postSummary = post.postSummary;
    return (
        <div>
            <H1>{post.postTitle}</H1>
            <div className="bg-base-200 py-4 px-4 rounded-lg md:mx-8">
                <div className="py-2">
                    <DateTime unixtime={post.postUnixTimeGMT} />
                </div>
                <div className="py-2">
                    <SummaryShowCard postSummary={postSummary.toString()} />
                </div>
                <div className="py-2 flex">
                    {tags?.map((tag: {tagId: number, tagName: string}) => (
                        <div key={tag.tagId} className="mx-1">
                            <TagShowCard tags={tag} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div
                // biome-ignore lint:
                dangerouslySetInnerHTML={{ __html: postHTML }} className="markdownHTML"
            />

            <ShareButtons
                currentURL={`https://contradictiononline.org/posts/${post.postId}`} 
                postTitle={post.postTitle} 
            />
        </div>
    );
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    if (!data || !data.post){
      return [{ title: "Loading..." }];
    }
    const title = data.post.postTitle || "";
    const description = data.post.postSummary || "";
    const ogLocale = "ja_JP";
    const ogSiteName = "現実モデリング";
    const ogType = "article";
    const ogTitle = title;
    const ogDescription = description;
    const ogUrl = data.post.postOGImageURL;
    const twitterCard = "summary_large_image"
    const twitterSite = "@contradictionon29"
    const twitterTitle = title
    const twitterDescription = description
    const twitterCreator = "@contradictionon29"
    const twitterImage = data.post.postOGImageURL
  
    return [
      { title },
      { description },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: ogDescription },
      { property: "og:locale", content: ogLocale },
      { property: "og:site_name", content: ogSiteName },
      { property: "og:type", content: ogType },
      { property: "og:url", content: ogUrl },
      { property: "og:image", content: twitterImage},
      { name: "twitter:card", content: twitterCard },
      { name: "twitter:site", content: twitterSite },
      { name: "twitter:title", content: twitterTitle },
      { name: "twitter:description", content: twitterDescription },
      { name: "twitter:creator", content: twitterCreator },
      { name: "twitter:image", content: twitterImage },
    ];
  };
  