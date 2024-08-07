import { ActionFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "../modules/auth.server";

export async function action({ request, context }: ActionFunctionArgs) {
	const authenticator = await getAuthenticator(context);
	return authenticator.logout(
		request,
		{ 
			redirectTo: "/back/edit",
		}
	);
}