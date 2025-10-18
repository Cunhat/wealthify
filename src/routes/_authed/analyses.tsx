import AnalysesView from "@/modules/analyses/views/analyses-view";
import { createFileRoute } from "@tanstack/react-router";
import dayjs from "dayjs";

export const Route = createFileRoute("/_authed/analyses")({
	component: AnalysesView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.analyses.getAvailableDates.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.analyses.getTransactionsForPeriod.queryOptions({
				year: dayjs().year(),
				month: dayjs().locale("en").format("MMMM"),
			}),
		);
	},
});
