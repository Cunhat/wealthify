import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency } from "@/lib/mixins";
import type { WishlistItem } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import CreateWishlistCategory from "../components/create-wishlist-category";
import CreateWishlistItem from "../components/create-wishlist-item";
import {
	AppliedFilters,
	WishlistFilters,
} from "../components/wishlist-filters";
import WishlistTable from "../sections/wishlist-table";

export default function WishlistView() {
	const trpc = useTRPC();
	const search = useSearch({ from: "/_authed/wishlist" });

	const itemsQuery = useQuery({
		...trpc.wishlist.listWishlistItems.queryOptions(),
	});

	useEffect(() => {
		if (itemsQuery.isError) {
			toast.error("Error fetching wishlist items");
		}
	}, [itemsQuery.isError]);

	// Filter items based on search params
	const filteredItems = useMemo(() => {
		if (!itemsQuery.data) return [];

		let items = itemsQuery.data;

		// Filter by category
		if (search.category && search.category.length > 0) {
			items = items.filter(
				(item: WishlistItem) =>
					item.category && search.category?.includes(item.category.id),
			);
		}

		// Filter by status
		if (search.status && search.status.length > 0) {
			items = items.filter((item: WishlistItem) =>
				search.status?.includes(item.status),
			);
		}

		return items;
	}, [itemsQuery.data, search.category, search.status]);

	// Calculate total amount for filtered items
	const totalAmount = useMemo(() => {
		return filteredItems.reduce((acc, item) => acc + Number(item.price), 0);
	}, [filteredItems]);

	return (
		<PageContainer
			title="Wishlist"
			actionsComponent={
				<div className="flex gap-2">
					<WishlistFilters />
					<CreateWishlistCategory />
					<CreateWishlistItem />
				</div>
			}
		>
			{itemsQuery.isLoading ? (
				<div>Loading...</div>
			) : itemsQuery.data?.length === 0 && Object.keys(search).length === 0 ? (
				<NotFound message="No wishlist items found. Create your first item!" />
			) : (
				<>
					<div className="flex items-center justify-between mb-4 p-4 bg-card border rounded-lg">
						<div>
							<p className="text-sm text-muted-foreground">
								{Object.keys(search).length > 0
									? "Filtered Total"
									: "Total Amount"}
							</p>
							<p className="text-2xl font-semibold tabular-nums">
								{formatCurrency(totalAmount)}
							</p>
						</div>
						{Object.keys(search).length > 0 && (
							<p className="text-sm text-muted-foreground">
								{filteredItems.length} item
								{filteredItems.length !== 1 ? "s" : ""}
							</p>
						)}
					</div>
					<AppliedFilters />
					<WishlistTable items={filteredItems} />
					{Object.keys(search).length > 0 &&
						!itemsQuery.isLoading &&
						filteredItems.length === 0 && (
							<NotFound message="No wishlist items found with the current filters" />
						)}
				</>
			)}
		</PageContainer>
	);
}
