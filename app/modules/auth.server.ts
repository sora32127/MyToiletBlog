import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";
import { createCookieSessionStorage } from "@remix-run/cloudflare";
import type { AppLoadContext } from "@remix-run/cloudflare";
import type { Env } from "env.d.ts";

const getEnvironMentValiables = (serverContext: AppLoadContext) => {
	// @ts-ignore
	const env = serverContext.cloudflare.env as Env;
	return {
		sessionSecret: env.SESSION_SECRET,
		clientID: env.GOOGLE_CLIENT_ID,
		clientSecret: env.GOOGLE_CLIENT_SECRET,
		callbackURL: env.GOOGLE_CALLBACK_URL,
		adminUserId: env.ADMIN_USER_ID,
	}
}

export async function getAuthenticator(serverContext: AppLoadContext){
	const { sessionSecret, clientID, clientSecret, callbackURL, adminUserId } = getEnvironMentValiables(serverContext);
	const sessionStorage = createCookieSessionStorage({
		cookie: {
			name: "auth_session",
			sameSite: "lax",
			path: "/",
			httpOnly: true,
			secrets: [sessionSecret],
			secure: true,
			maxAge: 60 * 60 * 24,
		},
	});
	const authenticator = new Authenticator<boolean>(sessionStorage);
	const googleStrategy = new GoogleStrategy<boolean>(
		{
			clientID: clientID,
			clientSecret: clientSecret,
			callbackURL: callbackURL,
		},
		async ({ profile }) => {
			console.log("profile in auth.server.ts", profile);
			const userId = profile.id;
			return userId === adminUserId;
		}
	);
	
	authenticator.use(googleStrategy);
	return authenticator;
}

export async function isAuthenticated(serverContext: AppLoadContext, request: Request) {
	const authenticator = await getAuthenticator(serverContext);
	const isAuthenticated = await authenticator.isAuthenticated(request);
	console.log("isAuthenticated", isAuthenticated);
	return isAuthenticated;
}