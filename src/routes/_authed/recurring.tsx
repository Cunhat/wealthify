import RecurringView from "@/modules/recurring/views/recurring-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/recurring")({
	component: RecurringView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.categories.listCategories.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.recurring.listRecurringTransactions.queryOptions(),
		);
	},
});
