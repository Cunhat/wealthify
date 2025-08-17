import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_authed/categories/$categoryId")({
	params: z.object({
		categoryId: z.string(),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { categoryId } = Route.useParams();

	return <div>Category ID: {categoryId}</div>;
}
