import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/budget")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_authed/budget"!</div>;
}
