import EmptyBadge from "@/components/empty-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import WishlistCategoryBadge from "@/components/wishlist-category-badge";
import WishlistStatusBadge from "@/components/wishlist-status-badge";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency } from "@/lib/mixins";
import type { WishlistItem } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

type WishlistTableProps = {
	items: WishlistItem[];
};

export default function WishlistTable({ items }: WishlistTableProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const deleteItemMutation = useMutation({
		...trpc.wishlist.deleteWishlistItem.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.wishlist.listWishlistItems.queryKey(),
			});
			toast.success("Item deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete item");
		},
	});

	const updateItemMutation = useMutation({
		...trpc.wishlist.updateWishlistItem.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.wishlist.listWishlistItems.queryKey(),
			});
			toast.success("Item updated successfully");
		},
		onError: () => {
			toast.error("Failed to update item");
		},
	});

	function handleDeleteItem(id: string) {
		if (confirm("Are you sure you want to delete this item?")) {
			deleteItemMutation.mutate({ id });
		}
	}

	function handleStatusChange(id: string, status: string) {
		updateItemMutation.mutate({ id, status });
	}

	if (!items.length) {
		return <EmptyBadge message="No wishlist items found" />;
	}

	return (
		<div className="overflow-y-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Category</TableHead>
						<TableHead>Created</TableHead>
						<TableHead className="w-[50px]"></TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((item) => (
						<TableRow key={item.id}>
							<TableCell className="font-medium">{item.name}</TableCell>
							<TableCell>{formatCurrency(Number(item.price))}</TableCell>
							<TableCell>
								<WishlistStatusBadge
									status={item.status}
									onStatusChange={(status) =>
										handleStatusChange(item.id, status)
									}
									disabled={updateItemMutation.isPending}
								/>
							</TableCell>
							<TableCell>
								{item.category ? (
									<WishlistCategoryBadge category={item.category} />
								) : (
									<span className="text-sm text-muted-foreground">
										No category
									</span>
								)}
							</TableCell>
							<TableCell>
								{dayjs(item.createdAt).format("MMM D, YYYY")}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<span className="sr-only">Open menu</span>
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => handleDeleteItem(item.id)}
											className="text-destructive"
										>
											<Trash2 className="mr-2 h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
