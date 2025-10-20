import EmptyBadge from "@/components/empty-badge";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatCurrency, groupTransactionsByDate } from "@/lib/mixins";
import type { Transaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Ban } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import AccountMenu from "../components/account-menu";
import BudgetCategoryMenu from "../components/budget-category-menu";
import CategoryMenu from "../components/category-menu";
import TransactionRowMenu from "../components/transaction-row-menu";

type TransactionsTableProps = {
	transactions: Transaction[];
	selectedTransactions: Set<string>;
	setSelectedTransactions: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export default function TransactionsTable({
	transactions,
	selectedTransactions,
	setSelectedTransactions,
}: TransactionsTableProps) {
	const handleSelectTransaction = useCallback(
		(transaction: Transaction, isSelected: boolean) => {
			setSelectedTransactions((prev) => {
				const newSet = new Set(prev);

				if (isSelected) {
					newSet.add(transaction.id);
				} else {
					newSet.delete(transaction.id);
				}
				return newSet;
			});
		},
		[setSelectedTransactions],
	);

	const groupedTransactions = useMemo(
		() => groupTransactionsByDate(transactions),
		[transactions],
	);

	return (
		<div className="overflow-y-auto">
			<Table>
				<TableBody>
					{Object.entries(groupedTransactions).map(
						([dateGroup, transactions]) => (
							<>
								<TableRow
									key={`group-${dateGroup}`}
									className="border-0 hover:bg-transparent"
								>
									<TableCell
										colSpan={8}
										className="text-lg text-foreground font-medium py-4 hover:bg-transparent"
									>
										{dateGroup}
									</TableCell>
								</TableRow>
								{transactions.map((transaction) => (
									<TransactionRow
										key={transaction.id}
										transaction={transaction}
										isSelected={selectedTransactions.has(transaction.id)}
										handleSelectTransaction={handleSelectTransaction}
									/>
								))}
							</>
						),
					)}
				</TableBody>
			</Table>
		</div>
	);
}

const TransactionRow = memo(
	({
		transaction,
		isSelected,
		handleSelectTransaction,
	}: {
		transaction: Transaction;
		isSelected: boolean;
		handleSelectTransaction: (
			transaction: Transaction,
			isSelected: boolean,
		) => void;
	}) => {
		return (
			<TableRow
				key={transaction.id}
				className={cn("border-0", isSelected && "bg-primary/10")}
			>
				<TableCell>
					<Checkbox
						checked={isSelected}
						onCheckedChange={(isSelected) =>
							handleSelectTransaction(transaction, isSelected as boolean)
						}
					/>
				</TableCell>
				<TableCell className="text-sm text-foreground">
					{transaction.description}
				</TableCell>
				<TableCell>
					<AccountMenu transaction={transaction} />
				</TableCell>
				<TableCell>
					{transaction.excluded ? (
						<Badge variant="destructive">
							<Ban className="size-4" />
							Excluded
						</Badge>
					) : null}
				</TableCell>
				<TableCell>
					<BudgetCategoryMenu transaction={transaction} />
				</TableCell>
				<TableCell>
					{transaction.category ? (
						<CategoryMenu transaction={transaction} />
					) : (
						<EmptyBadge message="No category" />
					)}
				</TableCell>
				<TableCell
					className={cn(
						"text-sm text-right",
						transaction.type === "expense" ? "" : "text-green-500",
					)}
				>
					{formatCurrency(Number(transaction.amount))}
				</TableCell>
				<TableCell className="flex justify-center items-center">
					<TransactionRowMenu transaction={transaction} />
				</TableCell>
			</TableRow>
		);
	},
);
