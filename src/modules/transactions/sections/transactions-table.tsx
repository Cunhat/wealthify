import CategoryBadge from "@/components/category-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Transaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatCurrency, groupTransactionsByDate } from "@/utils/mixins";
import { memo, useCallback, useMemo } from "react";
import AccountBadge from "../components/account-badge";
import TransactionRowMenu from "../components/transaction-row-menu";

type TransactionsTableProps = {
	transactions: Transaction[];
	selectedTransactions: Set<string>;
	setSelectedTransactions: React.Dispatch<React.SetStateAction<Set<string>>>;
	hasNextPage: boolean;
	fetchNextPage: () => void;
	isFetchingNextPage: boolean;
};

export default function TransactionsTable({
	transactions,
	selectedTransactions,
	setSelectedTransactions,
	hasNextPage,
	fetchNextPage,
	isFetchingNextPage,
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
		<div className="flex flex-col gap-4 overflow-y-auto">
			{Object.entries(groupedTransactions).map(([dateGroup, transactions]) => (
				<div key={dateGroup} className="flex flex-col gap-2">
					<div className="text-lg text-foreground font-medium pl-8">
						{dateGroup}
					</div>
					<div className="flex flex-col gap-1">
						{transactions.map((transaction) => (
							<TransactionRow
								key={transaction.id}
								transaction={transaction}
								isSelected={selectedTransactions.has(transaction.id)}
								handleSelectTransaction={handleSelectTransaction}
							/>
						))}
					</div>
				</div>
			))}
			{hasNextPage && (
				<div className="flex justify-center">
					<Button
						onClick={() => fetchNextPage()}
						variant="outline"
						size="sm"
						disabled={isFetchingNextPage}
					>
						{isFetchingNextPage ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}
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
			<div
				key={transaction.id}
				className={cn(
					"grid grid-cols-[25px_4fr_200px_1fr_100px_50px] items-center px-2 py-2 rounded-sm transition-colors",
					isSelected && "bg-primary/10",
				)}
			>
				<Checkbox
					checked={isSelected}
					onCheckedChange={(isSelected) =>
						handleSelectTransaction(transaction, isSelected as boolean)
					}
				/>
				<div className="text-sm text-foreground">{transaction.description}</div>
				<AccountBadge account={transaction?.transactionAccount} />
				{transaction.category ? (
					<CategoryBadge category={transaction.category} />
				) : (
					<div className="text-sm text-foreground">
						<span className="text-sm text-muted-foreground">
							No category...
						</span>
					</div>
				)}
				<div
					className={cn(
						"text-sm text-right",
						transaction.type === "expense" ? "" : "text-green-500",
					)}
				>
					{formatCurrency(Number(transaction.amount))}
				</div>
				<div className="flex justify-center">
					<TransactionRowMenu transaction={transaction} />
				</div>
			</div>
		);
	},
);
