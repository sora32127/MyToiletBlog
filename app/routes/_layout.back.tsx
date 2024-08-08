import { json } from "@remix-run/cloudflare";
import { Form, NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { isAuthenticated } from "../modules/auth.server";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const isValidUser = await isAuthenticated(context, request);
	return json({ isValidUser });
}

export default function Index() {
	const { isValidUser } = useLoaderData<typeof loader>();

	if (isValidUser) {
		return (
			<>
				<Form action="/api/auth/signout" method="post">
					<button type="submit" className="btn btn-primary m-4">サインアウト</button>
				</Form>
                <NavLink to="/" className="btn btn-primary m-4">ホームに戻る</NavLink>
                <NavLink to="/back/edit" className="btn btn-primary m-4">記事作成</NavLink>
                <NavLink to="/back/list" className="btn btn-primary m-4">記事一覧</NavLink>
                <Outlet />
			</>
		);
	}
	return (
		<Form action="/api/auth/signin" method="post">
			<button type="submit" className="btn btn-primary">サインイン</button>
		</Form>
	);
}