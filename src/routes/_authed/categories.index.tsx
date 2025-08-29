import NotFound from "@/components/not-found";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/categories/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<NotFound
			title="Select a category"
			message="Select a category to view its transactions"
		/>
	);
}
