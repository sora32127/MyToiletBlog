import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getAuthenticator } from "../modules/auth.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const authenticator = await getAuthenticator(context);
	return authenticator.authenticate("google", request, {
		successRedirect: "/back/edit",
		failureRedirect: "/back/edit",
	});
};