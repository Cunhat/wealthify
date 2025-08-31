import TransactionsView from "@/modules/transactions/views/transactions-view";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/transactions")({
	component: TransactionsView,
	beforeLoad: async ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.transactions.listTransactions.queryOptions({
				limit: 100,
			}),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listTransactionAccounts.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.categories.listCategories.queryOptions(),
		);
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Transactions",
			},
		],
	}),
});
