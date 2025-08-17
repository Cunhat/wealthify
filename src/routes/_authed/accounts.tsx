import AccountsView from "@/modules/accounts/views/accounts-view";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/accounts")({
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listAccounts.queryOptions(),
		);
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Accounts",
			},
		],
	}),
	component: AccountsView,
});
