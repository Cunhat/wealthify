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
			context.trpc.accounts.list.queryOptions(),
		);
	},
});

function App() {
	const trpc = useTRPC();
	const { user } = useRouteContext({ from: Route.id });
	const accountsQuery = useQuery(trpc.accounts.list.queryOptions());

	console.log(accountsQuery.data);

	if (accountsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="grid grid-cols-[300px_1fr] h-full">
			<div className="bg-amber-200">
				<AccountsWidget />
			</div>
			<div className="p-4">Hello, {user?.name}!</div>
		</div>
	);
}
