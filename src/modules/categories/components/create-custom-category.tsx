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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Form schema based on the category table structure
const createCategorySchema = z.object({
	name: z
		.string()
		.min(1, "Category name is required")
		.max(50, "Category name must be less than 50 characters"),
	icon: z.string().emoji("Should be an emoji").min(1, "Icon is required"),
	color: z
		.string()
		.regex(
			/^#[0-9A-Fa-f]{6}$/,
			"Color must be a valid hex color (e.g., #000000)",
		),
});

type CreateCategoryForm = z.infer<typeof createCategorySchema>;

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

	const form = useForm<CreateCategoryForm>({
		resolver: zodResolver(createCategorySchema),
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

	function onSubmit(values: CreateCategoryForm) {
		createCategoryMutation.mutate(values);
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4"
				id="create-category-form"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category Name</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., Food & Dining"
									{...field}
									disabled={createCategoryMutation.isPending}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="icon"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Icon (Emoji)</FormLabel>
							<FormControl>
								<Input
									placeholder="e.g., 🍕"
									{...field}
									disabled={createCategoryMutation.isPending}
									maxLength={10}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="color"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Color</FormLabel>
							<FormControl>
								<div className="flex gap-2 items-center">
									<Input
										type="color"
										{...field}
										disabled={createCategoryMutation.isPending}
										className="w-full h-10 p-1 border rounded cursor-pointer"
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
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
					<Button type="submit" disabled={createCategoryMutation.isPending}>
						{createCategoryMutation.isPending && (
							<Loader className="mr-2 h-4 w-4 animate-spin" />
						)}
						Create Category
					</Button>
				</div>
			</form>
		</Form>
	);
}
