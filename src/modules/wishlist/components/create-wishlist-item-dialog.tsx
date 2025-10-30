import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const wishlistStatusEnum = z.enum([
	"Do I really want this?",
	"I really want this",
	"I will buy this",
	"Purchased",
]);

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	price: z.number().min(0, "Price must be positive"),
	status: wishlistStatusEnum.default("Do I really want this?"),
	category: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface WishlistItemFormProps {
	setOpen: (open: boolean) => void;
}

export default function WishlistItemForm({
	setOpen,
}: WishlistItemFormProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const categoriesQuery = useQuery({
		...trpc.wishlist.listWishlistCategories.queryOptions(),
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			price: 0,
			status: "Do I really want this?",
			category: "",
		},
	});

	const createItemMutation = useMutation({
		...trpc.wishlist.createWishlistItem.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.wishlist.listWishlistItems.queryKey(),
			});
			toast.success("Wishlist item created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create wishlist item");
			console.error(error);
		},
	});

	function onSubmit(values: FormValues) {
		createItemMutation.mutate({
			name: values.name,
			price: values.price,
			status: values.status,
			category: values.category || undefined,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Item Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter item name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="price"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Price</FormLabel>
							<FormControl>
								<Input
									type="number"
									step="0.01"
									min="0"
									placeholder="0.00"
									className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
									{...field}
									onChange={(e) => {
										const value = Number.parseFloat(
											Number.parseFloat(e.target.value).toFixed(2),
										);
										field.onChange(Number.isNaN(value) ? 0 : value);
									}}
									value={field.value}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="status"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a status" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="Do I really want this?">
										Do I really want this?
									</SelectItem>
									<SelectItem value="I really want this">
										I really want this
									</SelectItem>
									<SelectItem value="I will buy this">
										I will buy this
									</SelectItem>
									<SelectItem value="Purchased">Purchased</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category (Optional)</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
								disabled={!categoriesQuery.data?.length}
							>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categoriesQuery.data?.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											<div className="flex items-center gap-2">
												<span>{category.icon}</span>
												<span>{category.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => {
							form.reset();
							setOpen(false);
						}}
						disabled={createItemMutation.isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={createItemMutation.isPending}>
						{createItemMutation.isPending ? "Creating..." : "Create"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}

