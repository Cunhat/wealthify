import CategoryBadge from "@/components/category-badge";
import { Separator } from "@/components/ui/separator";
import type {
	Transaction,
	TransactionAccountWithTransactions,
} from "@/lib/schemas";
import { cn } from "@/lib/utils";
import AccountBadge from "@/modules/transactions/components/account-badge";
import { formatCurrency, groupTransactionsByDate } from "@/utils/mixins";
import { useMemo } from "react";

type TransactionAccountProps = {
	account: TransactionAccountWithTransactions;
};

export default function TransactionAccount({
	account,
}: TransactionAccountProps) {
	console.log(account);

	const groupedTransactions = useMemo(
		() =>
			groupTransactionsByDate(account.transactions as unknown as Transaction[]),
		[account.transactions],
	);

	return (
		<div className="h-screen grid grid-cols-[1fr_10px_1fr] overflow-hidden gap-4">
			<div className="h-full flex flex-col gap-2 overflow-y-auto">
				<div className="flex justify-between">
					<AccountBadge account={account} size="lg" />
					<div className="text-lg text-foreground">
						{formatCurrency(Number(account.balance))}
					</div>
				</div>
			</div>
			<Separator orientation="vertical" />
			<div className="h-full overflow-y-auto">
				{Object.entries(groupedTransactions).map(
					([dateGroup, transactions]) => (
						<div key={dateGroup} className="flex flex-col gap-2">
							<div className="text-lg text-foreground font-medium">
								{dateGroup}
							</div>
							<div className="flex flex-col gap-1">
								{transactions.map((transaction) => (
									<div
										key={transaction.id}
										className="grid grid-cols-[3fr_2fr_1fr] items-center px-2 py-2 rounded-sm transition-colors"
									>
										<div className="text-sm text-foreground">
											{transaction.description}
										</div>
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
									</div>
								))}
							</div>
						</div>
					),
				)}
			</div>
		</div>
	);
}
