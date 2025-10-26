import CategoryBadge from "@/components/category-badge";
import EmptyBadge from "@/components/empty-badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type CategoryMenuProps = {
	transaction: Transaction;
};

export default function CategoryMenu({ transaction }: CategoryMenuProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listCategoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const updateTransactionCategory = useMutation({
		...trpc.transactions.updateTransactionCategory.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction category updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.getTransactions.queryKey(),
			});
		},
		onError: () => {
			toast.error("Failed to update transaction category");
		},
	});

	const handleCategoryChange = (categoryId: string) => {
		updateTransactionCategory.mutate({
			transactionId: [transaction.id],
			categoryId,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				{transaction.category ? (
					<CategoryBadge category={transaction.category} />
				) : (
					<EmptyBadge message="No category" />
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Categories</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listCategoriesQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listCategoriesQuery.data?.map((category) => (
					<DropdownMenuItem
						key={category.id}
						onClick={() => handleCategoryChange(category.id)}
						className="flex items-center gap-2"
					>
						{category.icon}
						<span>{category.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
