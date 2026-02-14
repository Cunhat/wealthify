import Category from "@/modules/categories/views/category";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute(
	"/_authed/categories/category/$categoryId",
)({
	params: z.object({
		categoryId: z.string(),
	}),
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.categories.getCategory.queryOptions({
				id: params.categoryId,
			}),
		);
	},
	component: Category,
});
