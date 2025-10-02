import BudgetView from "@/modules/budget/views/budget-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/budget")({
	component: BudgetView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.budget.getUserBudget.queryOptions(),
		);
	},
});
