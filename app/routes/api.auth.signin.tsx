import { getAuthenticator } from "../modules/auth.server";
import type { ActionFunctionArgs } from "@remix-run/cloudflare";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	console.log("Signin Process has been called", request, context);
	const authenticator = await getAuthenticator(context);
	console.log("authenticator", authenticator);
	return authenticator.authenticate("google", request);
};