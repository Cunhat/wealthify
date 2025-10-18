import AnalysesView from "@/modules/analyses/views/analyses-view";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/analyses")({
	component: AnalysesView,
});
