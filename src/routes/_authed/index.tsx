import DashboardView from "@/modules/dashboard/views/dashboard-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	component: DashboardView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listAccounts.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listTransactionAccounts.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listBalanceAccounts.queryOptions(),
		);
		await context.queryClient.prefetchQuery(
			context.trpc.accounts.listAccounts.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.metrics.getIncomeVsExpenses.queryOptions(),
		);
	},
	head: () => ({
		meta: [
			{
				title: "Wealthify - Dashboard",
			},
		],
	}),
});
