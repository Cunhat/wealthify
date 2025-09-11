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
import { useEffect } from "react";
import { Toaster } from "sonner";

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
			// Favicon and app icons
			{
				rel: "icon",
				href: "/icon.png",
				type: "image/png",
			},
			{
				rel: "apple-touch-icon",
				href: "/icon.png",
			},
			// PWA manifest
			{
				rel: "manifest",
				href: "/manifest.json",
			},
		],
	}),

	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		if (import.meta.env.DEV) {
			import("react-scan").then(({ scan }) => {
				scan({ enabled: true });
			});
		}
	}, []);
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
				<Toaster position="top-right" richColors />
			</body>
		</html>
	);
}
