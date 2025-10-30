import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import WishlistCategoryForm, {
	WishlistCategorySchema,
	type WishlistCategoryForm as WishlistCategoryFormType,
} from "./wishlist-category-form";

export default function CreateWishlistCategory() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<IconPlus className="mr-2 h-4 w-4" />
					New Category
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Create Wishlist Category</DialogTitle>
					<DialogDescription>
						Create a new category for organizing your wishlist items.
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

	const form = useForm<WishlistCategoryFormType>({
		resolver: zodResolver(WishlistCategorySchema),
		defaultValues: {
			name: "",
			icon: "💰",
			color: "#000000",
		},
	});

	const createCategoryMutation = useMutation({
		...trpc.wishlist.createWishlistCategory.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.wishlist.listWishlistCategories.queryKey(),
			});
			toast.success("Category created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create category");
			console.error(error);
		},
	});

	function onSubmit(values: WishlistCategoryFormType) {
		createCategoryMutation.mutate(values);
	}

	return (
		<>
			<WishlistCategoryForm
				form={form}
				onSubmit={onSubmit}
				disabled={createCategoryMutation.isPending}
				formId="create-wishlist-category-form"
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
					form="create-wishlist-category-form"
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

