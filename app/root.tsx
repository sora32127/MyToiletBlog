import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from "@remix-run/react";
import "./tailwind.css";
import { PageTransitionProgressBar } from "./Components/PageTransitionProgressBar";

import 'highlight.js/styles/tokyo-night-dark.css';
import { H1 } from "./Components/Headings";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <PageTransitionProgressBar />
        {children}
        <ScrollRestoration />
        <Scripts />
        <script src="https://b.st-hatena.com/js/bookmark_button.js"/>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            const savedTheme = localStorage.getItem("theme");
            if (savedTheme) {
              document.documentElement.setAttribute("data-theme", savedTheme);
            } else {
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              const defaultTheme = prefersDark ? "sunset" : "nord";
              document.documentElement.setAttribute("data-theme", defaultTheme);
              localStorage.setItem("theme", defaultTheme);
            }
          })();
        `}} />
      </body>
    </html>
  );
}

export function ErrorBoundary(){
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404){
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <H1>404 Page Not Found</H1>
        <p>お探しのページは見つかりませんでした。</p>
        <NavLink to="/" className="btn btn-primary">トップページに戻る</NavLink>
      </div>
    )
  } else {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <H1>500 Internal Server Error</H1>
        <pre className="bg-error p-4 mb-8 overflow-auto">{error instanceof Error ? error.stack : JSON.stringify(error)}</pre>
        <NavLink to="/" className="btn btn-primary">トップページに戻る</NavLink>
      </div>
    )
  }
}

export default function App() {
  return <Outlet />;
}
