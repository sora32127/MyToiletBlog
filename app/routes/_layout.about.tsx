import { H1, H2 } from "~/Components/Headings";
import { NavLink } from "@remix-run/react";

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