import { H1, H2 } from "~/Components/Headings";
import { MetaFunction, NavLink } from "@remix-run/react";

export default function About() {
    return (
      <div>
      <H1>About</H1>
      <p>サイト内部で利用しているアセットの詳細、および管理者について</p>
      <H2>サイト内部利用アセット</H2>
      <ul>
        <li><NavLink to="https://font.sleepcows.com/" className="nav-link">おつとめフォント</NavLink></li>
        <li><NavLink to="https://typingart.net/?p=44" className="nav-link">はんなり明朝</NavLink></li>
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