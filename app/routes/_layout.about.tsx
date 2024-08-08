import { H1, H2 } from "~/Components/Headings";
import type { MetaFunction } from "@remix-run/react";

export default function About() {
    return (
      <div>
      <H1>About</H1>
      <H2>Contact</H2>
      <ul>
        <li>
          <a href="https://www.twitter.com/messages/compose?recipient_id=1249916069344473088">X</a>
        </li>
        <li>
          <a href="mailto:contradiction29@gmail.com">Mail</a>
        </li>
      </ul>
      <H2>利用技術</H2>
      <ul>
        <li>Remix</li>
        <li>TailwindCSS</li>
        <li>daisyUI</li>
        <li>TypeScript</li>
        <li>Cloudflare Workers</li>
        <li>Cloudflare</li>
        <li>Cloudflare R2</li>
        <li>Cloudflare D1</li>
        <li>Prisma</li>
      </ul>
      </div>
    )
} 

export const meta: MetaFunction = () => {
  const title = "現実モデリング - About";
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