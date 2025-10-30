import WishlistView from "@/modules/wishlist/views/wishlist-view";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/_authed/wishlist")({
	component: WishlistView,
	validateSearch: z.object({
		category: z.array(z.string()).optional().catch([]),
		status: z.array(z.string()).optional().catch([]),
	}),
	beforeLoad: async ({ search }) => {
		return {
			search: search,
		};
	},
	loader: async ({ context }) => {
		await context.queryClient.prefetchQuery(
			context.trpc.wishlist.listWishlistItems.queryOptions(),
		);

		await context.queryClient.prefetchQuery(
			context.trpc.wishlist.listWishlistCategories.queryOptions(),
		);
	},
});

