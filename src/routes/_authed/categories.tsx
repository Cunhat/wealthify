import Categories from "@/modules/categories/views/categories";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/categories")({
	component: Categories,
	head: () => ({
		meta: [
			{
				title: "Categories",
			},
		],
	}),
	beforeLoad: ({ context }) => {
		if (!context.user) {
			return redirect({ to: "/login" });
		}
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.categories.listCategories.queryOptions(),
		);
	},
});
