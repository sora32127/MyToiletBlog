import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { Form, Outlet, useLoaderData } from "@remix-run/react";
import { getAuthenticator, isAuthenticated } from "../modules/auth.server";
import React from "react";

export async function loader({ request, context }: LoaderFunctionArgs) {
	const isValidUser = await isAuthenticated(context, request);
	return json({ isValidUser });
}

export default function Index() {
	const { isValidUser } = useLoaderData<typeof loader>();

	if (isValidUser) {
		return (
			<>
				<p>you are authenticated</p>
				<Form action="/api/auth/signout" method="post">
					<button type="submit" className="btn btn-primary">サインアウト</button>
				</Form>
                <Outlet />
			</>
		);
	} else {
		return (
			<Form action="/api/auth/signin" method="post">
				<button type="submit" className="btn btn-primary">サインイン</button>
			</Form>
		);
	}
}