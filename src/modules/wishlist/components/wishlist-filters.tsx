import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Check, Filter, Trash2, X } from "lucide-react";
import WishlistCategoryBadge from "@/components/wishlist-category-badge";
import WishlistStatusBadge from "@/components/wishlist-status-badge";

export function WishlistFilters() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const search = useSearch({ from: "/_authed/wishlist" });

	const categoriesQuery = useQuery({
		...trpc.wishlist.listWishlistCategories.queryOptions(),
	});

	const selectedCategories = search.category || [];
	const selectedStatuses = search.status || [];

	const statusOptions = [
		"Do I really want this?",
		"I really want this",
		"I will buy this",
		"Purchased",
	] as const;

	const handleCategoryToggle = (id: string) => {
		const isSelected = selectedCategories.includes(id);
		let newCategories: string[];

		if (isSelected) {
			newCategories = selectedCategories.filter((c) => c !== id);
		} else {
			newCategories = [...selectedCategories, id];
		}

		navigate({
			to: "/wishlist",
			search: {
				category: newCategories.length > 0 ? newCategories : undefined,
				status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
			},
		});
	};

	const handleStatusToggle = (status: string) => {
		const isSelected = selectedStatuses.includes(status);
		let newStatuses: string[];

		if (isSelected) {
			newStatuses = selectedStatuses.filter((s) => s !== status);
		} else {
			newStatuses = [...selectedStatuses, status];
		}

		navigate({
			to: "/wishlist",
			search: {
				category: selectedCategories.length > 0 ? selectedCategories : undefined,
				status: newStatuses.length > 0 ? newStatuses : undefined,
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<Filter className="size-3" />
					Filters
					{(selectedCategories.length > 0 || selectedStatuses.length > 0) && (
						<span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
							{selectedCategories.length + selectedStatuses.length}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Wishlist Filters</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
								{statusOptions.map((status) => {
									const isSelected = selectedStatuses.includes(status);
									return (
										<DropdownMenuItem
											key={status}
											onClick={() => handleStatusToggle(status)}
											className="flex items-center gap-2 cursor-pointer"
										>
											<WishlistStatusBadge status={status} />
											<span className="flex items-center justify-center w-4 h-4 ml-auto">
												{isSelected && <Check className="w-3 h-3" />}
											</span>
										</DropdownMenuItem>
									);
								})}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Categories</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
								{categoriesQuery.data?.map((category) => {
									const isSelected = selectedCategories.includes(category.id);
									return (
										<DropdownMenuItem
											key={category.id}
											onClick={() => handleCategoryToggle(category.id)}
											className="flex items-center gap-2 cursor-pointer"
										>
											<WishlistCategoryBadge category={category} />
											<span className="flex items-center justify-center w-4 h-4 ml-auto">
												{isSelected && <Check className="w-3 h-3" />}
											</span>
										</DropdownMenuItem>
									);
								})}
								{categoriesQuery.data?.length === 0 && (
									<DropdownMenuItem disabled>
										No categories found
									</DropdownMenuItem>
								)}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function AppliedFilters() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const search = useSearch({ from: "/_authed/wishlist" });

	const removeCategoryFilter = (categoryId: string) => {
		const selectedCategories = search.category || [];
		const selectedStatuses = search.status || [];
		const newCategories = selectedCategories.filter((c) => c !== categoryId);

		navigate({
			to: "/wishlist",
			search: {
				category: newCategories.length > 0 ? newCategories : undefined,
				status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
			},
		});
	};

	const removeStatusFilter = (status: string) => {
		const selectedCategories = search.category || [];
		const selectedStatuses = search.status || [];
		const newStatuses = selectedStatuses.filter((s) => s !== status);

		navigate({
			to: "/wishlist",
			search: {
				category: selectedCategories.length > 0 ? selectedCategories : undefined,
				status: newStatuses.length > 0 ? newStatuses : undefined,
			},
		});
	};

	const categories = useQuery({
		...trpc.wishlist.listWishlistCategories.queryOptions(),
	});

	const statusOptions = [
		"Do I really want this?",
		"I really want this",
		"I will buy this",
		"Purchased",
	] as const;

	if (Object.keys(search).length === 0) {
		return null;
	}

	if (categories.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="flex gap-2 items-center flex-wrap mb-4">
			{search.status &&
				search.status.length > 0 &&
				search.status.map((status) => (
					<button
						key={status}
						type="button"
						className="flex cursor-pointer items-center gap-1 text-sm rounded-sm px-2 py-1.5 hover:opacity-80"
						onClick={() => removeStatusFilter(status)}
						aria-label={`Remove ${status} filter`}
					>
						<WishlistStatusBadge status={status} />
						<X className="w-4 h-4" />
					</button>
				))}

			{search.category &&
				search.category.length > 0 &&
				categories.data
					?.filter((category) => search.category?.includes(category.id))
					.map((category) => {
						return (
							<button
								key={category.id}
								type="button"
								style={
									{
										"--category-color": category.color,
									} as React.CSSProperties
								}
								className="flex cursor-pointer items-center gap-1 bg-[color:var(--category-color)]/10 text-[color:var(--category-color)] text-sm rounded-sm px-2 py-1.5 hover:bg-[color:var(--category-color)]/20"
								onClick={() => removeCategoryFilter(category.id)}
								aria-label={`Remove ${category.name} filter`}
							>
								<span>{category.icon}</span>
								<span>{category.name}</span>
								<X className="w-4 h-4" />
							</button>
						);
					})}

			<Button
				variant="outline"
				size="sm"
				onClick={() => navigate({ to: "/wishlist" })}
			>
				<Trash2 className="size-4" />
				Clear All
			</Button>
		</div>
	);
}

