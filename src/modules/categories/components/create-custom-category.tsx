import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import CategoryForm, {
	CategorySchema,
	type CategoryForm as CategoryFormType,
} from "./category-form";

export default function CreateCustomCategory() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<IconPlus />
					Custom Category
				</DropdownMenuItem>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Custom Category</DialogTitle>
					<DialogDescription>
						Create a new category for organizing your transactions.
					</DialogDescription>
				</DialogHeader>
				<CreateCategoryForm setOpen={setOpen} />
			</DialogContent>
		</Dialog>
	);
}

function CreateCategoryForm({ setOpen }: { setOpen: (open: boolean) => void }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<CategoryFormType>({
		resolver: zodResolver(CategorySchema),
		defaultValues: {
			name: "",
			icon: "💰",
			color: "#000000",
		},
	});

	const createCategoryMutation = useMutation({
		...trpc.categories.createCategory.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.categories.listCategories.queryKey(),
			});
			toast.success("Category created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create category");
			console.error(error);
		},
	});

	function onSubmit(values: CategoryFormType) {
		createCategoryMutation.mutate(values);
	}

	return (
		<>
			<CategoryForm
				form={form}
				onSubmit={onSubmit}
				disabled={createCategoryMutation.isPending}
				formId="create-category-form"
			/>
			<div className="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => setOpen(false)}
					disabled={createCategoryMutation.isPending}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					form="create-category-form"
					disabled={createCategoryMutation.isPending}
				>
					{createCategoryMutation.isPending && (
						<Loader className="mr-2 h-4 w-4 animate-spin" />
					)}
					Create Category
				</Button>
			</div>
		</>
	);
}
