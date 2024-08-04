import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";

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
        {children}
        <ScrollRestoration />
        <Scripts />
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

export default function App() {
  return <Outlet />;
}
