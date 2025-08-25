import CategoryBadge from "@/components/category-badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Transaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/mixins";
import dayjs from "dayjs";
import AccountBadge from "../components/account-badge";

type TransactionsTableProps = {
	transactions: Transaction[];
};

export default function TransactionsTable({
	transactions,
}: TransactionsTableProps) {
	function formatDateGroup(date: Date) {
		const formattedDate = dayjs(date);

		if (formattedDate.isSame(dayjs(), "day")) {
			return "Today";
		}

		if (formattedDate.isSame(dayjs().subtract(1, "day"), "day")) {
			return "Yesterday";
		}

		return formattedDate.format("ddd, MMM D");
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
	const groupedTransactions = groupTransactionsByDate(transactions);

	return (
		<div className="flex flex-col gap-4 overflow-y-auto">
			{Object.entries(groupedTransactions).map(([dateGroup, transactions]) => (
				<div key={dateGroup} className="flex flex-col gap-2">
					<div className="text-sm text-muted-foreground font-medium">
						{dateGroup}
					</div>
					<div className="flex flex-col gap-2">
						{transactions.map((transaction) => (
							<div
								key={transaction.id}
								className="grid grid-cols-[20px_4fr_200px_1fr_100px] gap-4"
							>
								<Checkbox className="" />
								<div className="text-sm">{transaction.description}</div>
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
