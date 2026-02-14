import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema/index";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user: user,
			session: session,
			account: account,
			verification: verification,
		},
	}),
	plugins: [reactStartCookies()],
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			prompt: "select_account",
		},
	},
});
