import TransactionsView from "@/modules/transactions/views/transactions-view";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_authed/transactions")({
	component: TransactionsView,
	validateSearch: z.object({
		category: z.array(z.string()).optional().catch([]),
		account: z.array(z.string()).optional().catch([]),
	}),
	beforeLoad: async ({ context, search }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}

		return {
			search: search,
		};
	},
	loader: async (test) => {
		const { context } = test;

		await context.queryClient.prefetchQuery(
			context.trpc.transactions.listTransactions.queryOptions({
				limit: 100,
				categoryNames: context.search.category,
				accountNames: context.search.account,
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
