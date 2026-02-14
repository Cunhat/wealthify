import NotFound from "@/components/not-found";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency, groupTransactionsByDate } from "@/lib/mixins";
import type { Transaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import AccountBadge from "@/modules/transactions/components/account-badge";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import CategoryActions from "../components/category-actions";

export default function Category() {
	const trpc = useTRPC();
	const { categoryId } = useParams({
		from: "/_authed/categories/category/$categoryId",
	});

	const categoryQuery = useQuery({
		...trpc.categories.getCategory.queryOptions({
			id: categoryId,
		}),
	});

	if (categoryQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (categoryQuery.isError) {
		return <div>Error: {categoryQuery.error.message}</div>;
	}

	const groupedTransactions = groupTransactionsByDate(
		categoryQuery.data?.transactions as Transaction[],
	);

	return (
		<div className="h-full flex flex-col gap-4 overflow-hidden">
			<div className="flex items-center gap-2">
				<div
					className="size-2 rounded-full"
					style={{ backgroundColor: categoryQuery.data?.color }}
				/>
				<span>{categoryQuery.data?.icon}</span>
				<h1 className="text-lg font-semibold">{categoryQuery.data?.name}</h1>
				<CategoryActions categoryId={categoryId} />
			</div>
			{categoryQuery.data?.transactions &&
			categoryQuery.data?.transactions?.length > 0 ? (
				<div className="flex flex-col gap-4 overflow-y-auto">
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
											className="grid grid-cols-[4fr_2fr_100px] items-center px-0 py-2 rounded-sm transition-colors"
										>
											<div className="text-sm text-foreground">
												{transaction.description}
											</div>
											<AccountBadge account={transaction?.transactionAccount} />
											<div
												className={cn(
													"text-sm text-right",
													transaction.type === "expense"
														? ""
														: "text-green-500",
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
			) : (
				<NotFound message="No transactions found for this category" />
			)}
		</div>
	);
}
