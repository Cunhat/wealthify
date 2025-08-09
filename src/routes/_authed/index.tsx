import AccountsWidget from "@/components/accounts-widget";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	redirect,
	useRouteContext,
} from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	component: App,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			return redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listTransactionAccounts.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listBalanceAccounts.queryOptions(),
		);
	},
});

function App() {
	const { user } = useRouteContext({ from: Route.id });

	return (
		<div className="grid grid-cols-[300px_1fr] h-full">
			<AccountsWidget />
			<div className="p-4">Hello, {user?.name}!</div>
		</div>
	);
}
