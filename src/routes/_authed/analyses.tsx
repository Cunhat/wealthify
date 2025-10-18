import AnalysesView from "@/modules/analyses/views/analyses-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/analyses")({
	component: AnalysesView,
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.analyses.getAvailableDates.queryOptions(),
		);
	},
});
