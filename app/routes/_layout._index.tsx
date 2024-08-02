import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "現実モデリング" },
    {
      name: "description",
      content: "contradiction29の個人ブログだよ",
    },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Recent</h1>
    </div>
  );
}
