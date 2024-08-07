import { ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { getAuthenticator } from "../modules/auth.server";

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const authenticator = await getAuthenticator(context);
	return authenticator.authenticate("google", request);
};