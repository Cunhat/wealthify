import TransactionsView from "@/modules/transactions/views/transactions-view";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_authed/transactions")({
	component: TransactionsView,
	validateSearch: z.object({
		category: z.array(z.string()).optional().catch([]),
		account: z.array(z.string()).optional().catch([]),
	}),
	beforeLoad: async ({ search }) => {
		return {
			search: search,
		};
	},
	loader: async ({ context }) => {
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

		await context.queryClient.prefetchQuery(
			context.trpc.budget.getBudgetCategories.queryOptions(),
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
