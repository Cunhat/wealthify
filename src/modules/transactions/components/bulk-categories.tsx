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

type BulkCategoriesProps = {
	transactions: Transaction[];
};

export default function BulkCategories({ transactions }: BulkCategoriesProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listCategoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	if (listCategoriesQuery.isError) {
		return null;
	}

	const updateTransactionCategory = useMutation({
		...trpc.transactions.updateTransactionCategory.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction category updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.listTransactions.queryKey(),
			});
		},
		onError: () => {
			toast.error("Failed to update transaction category");
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Categories</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Categories</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listCategoriesQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listCategoriesQuery.data?.map((category) => {
					return (
						<DropdownMenuItem
							className="flex items-center gap-2"
							key={category.id}
							onClick={() => {
								updateTransactionCategory.mutate({
									transactionId: transactions.map((t) => t.id),
									categoryId: category.id,
								});
							}}
						>
							{category.icon}
							<span>{category.name}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
