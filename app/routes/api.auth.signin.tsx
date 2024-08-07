import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "../modules/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	console.log("Signin Process has been called", request, context);
	const authenticator = await getAuthenticator(context);
	console.log("authenticator", authenticator);
	return authenticator.authenticate("google", request);
};