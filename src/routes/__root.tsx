import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import TanStackQueryLayout from "../integrations/tanstack-query/layout.tsx";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

import type { TRPCRouter } from "@/integrations/trpc/router";
import { auth } from "@/lib/auth.ts";

import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { User } from "better-auth";

interface MyRouterContext {
	queryClient: QueryClient;
	trpc: TRPCOptionsProxy<TRPCRouter>;
}

const fetchBetterAuth = createServerFn({ method: "GET" }).handler(async () => {
	const request = getWebRequest();
	const session = request
		? await auth.api.getSession({ headers: request.headers })
		: null;

	return {
		user: session?.user,
	};
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		const { user } = await fetchBetterAuth();

		return {
			user,
		};
	},
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Wealthify",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackRouterDevtools />
				<TanStackQueryLayout />
				<Scripts />
			</body>
		</html>
	);
}
