import EmptyBadge from "@/components/empty-badge";
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

type BudgetCategoryMenuProps = {
	transaction: Transaction;
};

export default function BudgetCategoryMenu({
	transaction,
}: BudgetCategoryMenuProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listBudgetCategoriesQuery = useQuery({
		...trpc.budget.getBudgetCategories.queryOptions(),
	});

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

	const handleBudgetCategoryChange = (budgetCategoryId: string) => {
		updateTransactionBudgetCategory.mutate({
			transactionId: [transaction.id],
			budgetCategoryId,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				{transaction.budgetCategory ? (
					<p className="text-sm text-foreground">
						{transaction.budgetCategory.name}
					</p>
				) : (
					<EmptyBadge message="No budget category" />
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Budget Categories</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listBudgetCategoriesQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listBudgetCategoriesQuery.data?.map((budgetCategory) => (
					<DropdownMenuItem
						key={budgetCategory.id}
						onClick={() => handleBudgetCategoryChange(budgetCategory.id)}
						className="flex items-center gap-2"
					>
						<span>{budgetCategory.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
