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
import { Check, Filter } from "lucide-react";

export default function TransactionsFilters() {
	const trpc = useTRPC();
	const navigate = useNavigate();
	const search = useSearch({ from: "/_authed/transactions" });

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const selectedCategories = search.category || [];

	const handleCategoryToggle = (id: string) => {
		const isSelected = selectedCategories.includes(id);
		let newCategories: string[];

		if (isSelected) {
			// Remove category from selection
			newCategories = selectedCategories.filter((c) => c !== id);
		} else {
			// Add category to selection
			newCategories = [...selectedCategories, id];
		}

		// Navigate with updated search params
		navigate({
			to: "/transactions",
			search: {
				category: newCategories.length > 0 ? newCategories : undefined,
			},
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">
					<Filter className="size-3" />
					Filters
					{selectedCategories.length > 0 && (
						<span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
							{selectedCategories.length}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Transactions Filters</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Categories</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
								{categoriesQuery.data?.map((category) => {
									const isSelected = selectedCategories.includes(category.name);
									return (
										<DropdownMenuItem
											key={category.id}
											onClick={() => handleCategoryToggle(category.name)}
											className="flex items-center gap-2 cursor-pointer"
										>
											<span className="flex items-center justify-center w-4 h-4">
												{isSelected && <Check className="w-3 h-3" />}
											</span>
											<span className="text-sm">{category.icon}</span>
											<span>{category.name}</span>
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
