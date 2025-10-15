import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Ban,
	Check,
	DollarSign,
	Edit,
	EllipsisVertical,
	Tag,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditTransactionForm from "./edit-transaction-form";

type TransactionRowMenuProps = {
	transaction: Transaction;
};

export default function TransactionRowMenu({
	transaction,
}: TransactionRowMenuProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const listCategoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const listBudgetCategoriesQuery = useQuery({
		...trpc.budget.getBudgetCategories.queryOptions(),
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

	const deleteTransactionMutation = useMutation({
		...trpc.transactions.deleteTransaction.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.getTransactions.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listTransactionAccounts.queryKey(),
			});
			toast.success("Transaction deleted successfully");
		},
		onError: () => {
			toast.error("Failed to delete transaction");
		},
	});

	const updateTransactionExcluded = useMutation({
		...trpc.transactions.updateTransactionExcluded.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction excluded updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.getTransactions.queryKey(),
			});
		},
		onError: () => {
			toast.error("Failed to update transaction excluded");
		},
	});

	const handleCategoryChange = (categoryId: string) => {
		updateTransactionCategory.mutate({
			transactionId: [transaction.id],
			categoryId,
		});
	};

	const handleBudgetCategoryChange = (budgetCategoryId: string) => {
		updateTransactionBudgetCategory.mutate({
			transactionId: [transaction.id],
			budgetCategoryId,
		});
	};

	const handleDeleteTransaction = () => {
		deleteTransactionMutation.mutate({
			transactions: [transaction.id],
		});
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm" className="size-4 p-0">
						<EllipsisVertical className="size-3" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Tag className="mr-2 h-4 w-4" />
							<span>Category</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
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
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<DollarSign className="mr-2 h-4 w-4" />
							<span>Budget Category</span>
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
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
						</DropdownMenuSubContent>
					</DropdownMenuSub>

					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() =>
							updateTransactionExcluded.mutate({
								transactionId: transaction.id,
								excluded: !transaction.excluded,
							})
						}
					>
						{transaction.excluded ? (
							<Check className="h-4 w-4" />
						) : (
							<Ban className="h-4 w-4" />
						)}
						{transaction.excluded ? "Include" : "Exclude"}
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem
						onClick={handleDeleteTransaction}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="h-4 w-4" color="red" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Transaction Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Transaction</DialogTitle>
					</DialogHeader>
					<EditTransactionForm
						transaction={transaction}
						setOpen={setEditDialogOpen}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
