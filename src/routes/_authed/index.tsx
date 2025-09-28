import DashboardView from "@/modules/dashboard/views/dashboard-view";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/")({
	component: DashboardView,
	beforeLoad: ({ context }) => {
		if (!context.user) {
			throw redirect({ to: "/login" });
		}
	},
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

		await context.queryClient.prefetchQuery(
			context.trpc.metrics.getNetWorth.queryOptions(),
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
