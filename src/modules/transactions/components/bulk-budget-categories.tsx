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

type BulkBudgetCategoriesProps = {
	transactions: Transaction[];
};

export default function BulkBudgetCategories({
	transactions,
}: BulkBudgetCategoriesProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listBudgetCategoriesQuery = useQuery({
		...trpc.budget.getBudgetCategories.queryOptions(),
	});

	if (listBudgetCategoriesQuery.isError) {
		return null;
	}

	const updateTransactionBudgetCategory = useMutation({
		...trpc.transactions.updateTransactionBudgetCategory.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction budget category updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.getTransactions.queryKey(),
			});
		},
		onError: () => {
			toast.error("Failed to update transaction budget category");
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Budget Categories</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Budget Categories</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listBudgetCategoriesQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listBudgetCategoriesQuery.data?.map((budgetCategory) => {
					return (
						<DropdownMenuItem
							className="flex items-center gap-2"
							key={budgetCategory.id}
							onClick={() => {
								updateTransactionBudgetCategory.mutate({
									transactionId: transactions.map((t) => t.id),
									budgetCategoryId: budgetCategory.id,
								});
							}}
						>
							<span>{budgetCategory.name}</span>
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
