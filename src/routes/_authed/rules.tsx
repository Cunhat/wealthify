import RulesView from "@/modules/rules/views/rules-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/rules")({
	component: RulesView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.rules.listRules.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.categories.listCategories.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.budget.getBudgetCategories.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listTransactionAccounts.queryOptions(),
		);
	},
	head: () => ({
		meta: [{ title: "Wealthify - Rules" }],
	}),
});
