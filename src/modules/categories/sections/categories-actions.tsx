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
import { SampleCategories } from "@/lib/configs/categories";
import { IconLoader2 } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";
import CreateCategoryGroup from "../components/create-category-group";
import CreateCustomCategory from "../components/create-custom-category";

export default function CategoriesActions() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const createCategoryMutation = useMutation({
		...trpc.categories.createCategory.mutationOptions(),
		onSuccess: () => {
			toast.success("Category created successfully");
			queryClient.invalidateQueries({
				queryKey: trpc.categories.listCategories.queryKey(),
			});
		},
		onError: (error) => {
			toast.error("Failed to create category");
			console.error(error);
		},
	});

	if (categoriesQuery.isLoading) {
		return (
			<Button variant="outline" size="icon" disabled>
				<IconLoader2 className="animate-spin" />
			</Button>
		);
	}

	const availableCategoriesToCreate = SampleCategories.filter(
		(category) => !categoriesQuery.data?.some((c) => c.name === category.name),
	);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<EllipsisVertical />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Categories</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<CreateCategoryGroup />
					<DropdownMenuSeparator />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Add Category</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent>
								<CreateCustomCategory />
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Categories List</DropdownMenuLabel>
								{availableCategoriesToCreate.map((category) => (
									<DropdownMenuItem
										key={category.id}
										className="flex gap-1 items-center"
										onClick={() => {
											createCategoryMutation.mutate({
												name: category.name,
												icon: category.icon,
												color: category.color,
											});
										}}
									>
										<span className="text-xs">{category.icon}</span>
										<span className="text-sm">{category.name}</span>
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
