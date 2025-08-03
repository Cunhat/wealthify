import { schema } from "@/components/data-table";
import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";

export const auth = betterAuth({
	plugins: [reactStartCookies()],
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			...schema,
			user: user,
			session: session,
			account: account,
			verification: verification,
		},
	}),
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
});
