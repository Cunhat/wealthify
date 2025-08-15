import Categories from "@/modules/categories/views/categories";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/categories")({
	component: Categories,
	head: () => ({
		meta: [
			{
				title: "Categories",
			},
		],
	}),
});
