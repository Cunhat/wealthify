import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit, EllipsisVertical, Loader, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryForm, {
	CategorySchema,
	type CategoryForm as CategoryFormType,
} from "./category-form";

type CategoryActionsProps = {
	categoryId: string;
};

export default function CategoryActions({ categoryId }: CategoryActionsProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const categoryQuery = useQuery({
		...trpc.categories.getCategory.queryOptions({ id: categoryId }),
	});

	const form = useForm<CategoryFormType>({
		resolver: zodResolver(CategorySchema),
		values: {
			name: categoryQuery.data?.name || "",
			icon: categoryQuery.data?.icon || "💰",
			color: categoryQuery.data?.color || "#000000",
		},
	});

	const updateCategoryMutation = useMutation({
		...trpc.categories.updateCategory.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.categories.listCategories.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.categories.getCategory.queryKey({ id: categoryId }),
			});
			toast.success("Category updated successfully");
			setEditDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to update category");
		},
	});

	const deleteCategoryMutation = useMutation({
		...trpc.categories.deleteCategory.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.categories.listCategories.queryKey(),
			});
			toast.success("Category deleted successfully");
			setDeleteDialogOpen(false);
			navigate({ to: "/categories" });
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to delete category");
		},
	});

	function onEditSubmit(values: CategoryFormType) {
		updateCategoryMutation.mutate({
			id: categoryId,
			...values,
		});
	}

	function onDeleteConfirm() {
		deleteCategoryMutation.mutate({ id: categoryId });
	}

	if (categoryQuery.isLoading) {
		return (
			<Button variant="outline" size="icon" className="ml-auto">
				<Loader className="h-4 w-4 animate-spin" />
				<span className="sr-only">Open menu</span>
			</Button>
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="outline" size="icon" className="ml-auto">
						<EllipsisVertical className="h-4 w-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" />
						Edit Category
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setDeleteDialogOpen(true)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="h-4 w-4" color="red" />
						Delete Category
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Category Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Category</DialogTitle>
						<DialogDescription>
							Make changes to your category here. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<CategoryForm
						form={form}
						onSubmit={onEditSubmit}
						disabled={updateCategoryMutation.isPending}
						formId="edit-category-form"
					/>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setEditDialogOpen(false)}
							disabled={updateCategoryMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-category-form"
							disabled={updateCategoryMutation.isPending}
						>
							{updateCategoryMutation.isPending && (
								<Loader className="mr-2 h-4 w-4 animate-spin" />
							)}
							Save Changes
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Delete Category Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Delete Category</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this category? This action cannot
							be undone. All transactions associated with this category will
							lose their category assignment.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={deleteCategoryMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={onDeleteConfirm}
							disabled={deleteCategoryMutation.isPending}
						>
							{deleteCategoryMutation.isPending && (
								<Loader className="mr-2 h-4 w-4 animate-spin" />
							)}
							Delete Category
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
