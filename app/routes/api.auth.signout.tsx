import { getAuthenticator } from "../modules/auth.server";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export async function action({ request, context }: ActionFunctionArgs) {
	const authenticator = await getAuthenticator(context);
	return authenticator.logout(
		request,
		{ 
			redirectTo: "/back/edit",
		}
	);
}