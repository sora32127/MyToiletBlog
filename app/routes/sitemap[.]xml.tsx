import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { getPostsInSitemap } from "../modules/db.server";


export async function loader({ context }: LoaderFunctionArgs) {
    const posts = await getPostsInSitemap(context);
    const staticContent = [
        {
            slug: "/",
            priority: "1.0"
        },
        {
            slug: "/about",
            priority: "0.8"
        },
        {
            slug: "/recent",
            priority: "0.8"
        },
    ]
    const siteRoot = "https://contradictiononline.org"
    const content = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticContent.map(doc => `<url><loc>${siteRoot}${doc.slug}</loc><priority>${doc.priority}</priority></url>`).join('\n')}
      ${posts.map(doc => `<url><loc>${siteRoot}/posts/${doc.postId}</loc><priority>${0.7}</priority></url>`).join('\n')}
    </urlset>
    `

    return new Response(content, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=86400",
            "xml-version": "1.0",
            "encoding": "UTF-8"
        }
    });
}