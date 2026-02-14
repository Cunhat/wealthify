import CategoryGroup from "@/modules/categories/views/category-group";
import { createFileRoute } from "@tanstack/react-router";
import z from "zod";

export const Route = createFileRoute("/_authed/categories/group/$groupId")({
	params: z.object({
		groupId: z.string(),
	}),
	loader: async ({ context, params }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.categoryGroups.getCategoryGroup.queryOptions({
				id: params.groupId,
			}),
		);
	},
	component: CategoryGroup,
});
