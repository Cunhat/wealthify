import CategoryBadge from "@/components/category-badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Transaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/mixins";
import dayjs from "dayjs";
import AccountBadge from "../components/account-badge";

type TransactionsTableProps = {
	transactions: Transaction[];
	selectedTransactions: Transaction[];
	setSelectedTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
};

export default function TransactionsTable({
	transactions,
	selectedTransactions,
	setSelectedTransactions,
}: TransactionsTableProps) {
	function formatDateGroup(date: Date) {
		const formattedDate = dayjs(date);

		if (formattedDate.isSame(dayjs(), "day")) {
			return "Today";
		}

		if (formattedDate.isSame(dayjs().subtract(1, "day"), "day")) {
			return "Yesterday";
		}

		return formattedDate.format("ddd, MMMM D");
	}

	function groupTransactionsByDate(transactions: Transaction[]) {
		const groups: { [key: string]: Transaction[] } = {};

		for (const transaction of transactions) {
			if (!transaction.createdAt) continue;

			const dateGroup = formatDateGroup(transaction?.createdAt);

			if (!groups[dateGroup]) {
				groups[dateGroup] = [];
			}

			groups[dateGroup].push(transaction);
		}

		return groups;
	}

	function handleSelectTransaction(
		transaction: Transaction,
		isSelected: boolean,
	) {
		if (isSelected) {
			setSelectedTransactions((prev) => [...prev, transaction]);
		} else {
			setSelectedTransactions((prev) =>
				prev.filter((t) => t.id !== transaction.id),
			);
		}
	}

	const groupedTransactions = groupTransactionsByDate(transactions);

	return (
		<div className="flex flex-col gap-4 overflow-y-auto">
			{Object.entries(groupedTransactions).map(([dateGroup, transactions]) => (
				<div key={dateGroup} className="flex flex-col gap-2">
					<div className="text-lg text-foreground font-medium pl-8">
						{dateGroup}
					</div>
					<div className="flex flex-col gap-1">
						{transactions.map((transaction) => (
							<div
								key={transaction.id}
								className={cn(
									"grid grid-cols-[25px_4fr_200px_1fr_100px] items-center px-2 py-2 rounded-sm transition-colors",
									selectedTransactions.some(
										(slt) => slt.id === transaction.id,
									) && "bg-primary/10",
								)}
							>
								<Checkbox
									className=""
									checked={selectedTransactions.some(
										(t) => t.id === transaction.id,
									)}
									onCheckedChange={(isSelected) =>
										handleSelectTransaction(transaction, isSelected as boolean)
									}
								/>
								<div className="text-sm text-foreground">
									{transaction.description}
								</div>
								<AccountBadge account={transaction?.transactionAccount} />
								<CategoryBadge category={transaction.category} />
								<div
									className={cn(
										"text-sm text-right",
										transaction.type === "expense" ? "" : "text-green-500",
									)}
								>
									{formatCurrency(Number(transaction.amount))}
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
