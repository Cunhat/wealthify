import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SelectedTransactions from "../components/selected-transactions";
import TransactionsFilters from "../components/transactions-filters";
import CreateTransaction from "../sections/create-transaction";
import TransactionsTable from "../sections/transactions-table";

export default function TransactionsView() {
	const [selectedTransactionIds, setSelectedTransactionIds] = useState<
		Set<string>
	>(new Set());

	const trpc = useTRPC();
	const search = useSearch({ from: "/_authed/transactions" });

	const listTransactionsQuery = useInfiniteQuery({
		...trpc.transactions.listTransactions.infiniteQueryOptions({
			limit: 100,
			categoryNames:
				search.category && search.category.length > 0
					? search.category
					: undefined,
		}),
		getNextPageParam: (lastPage) => lastPage.nextCursor,
		initialPageParam: null as Date | null,
	});

	useEffect(() => {
		if (listTransactionsQuery.isError) {
			toast.error("Error fetching transactions");
		}
	}, [listTransactionsQuery.isError]);

	const selectedTransactions = useMemo(() => {
		if (!listTransactionsQuery.data) return [];

		return listTransactionsQuery.data.pages.flatMap((page) =>
			page.transactions.filter((t) => selectedTransactionIds.has(t.id)),
		);
	}, [listTransactionsQuery.data, selectedTransactionIds]);

	if (listTransactionsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<PageContainer
			title="Transactions"
			actionsComponent={
				<div className="flex gap-2 w-full justify-between">
					{/* <GenerateTransactionsButton /> */}
					<TransactionsFilters />
					<SelectedTransactions
						transactions={selectedTransactions}
						setSelectedTransactions={setSelectedTransactionIds}
					/>
					<CreateTransaction />
				</div>
			}
		>
			<TransactionsTable
				transactions={
					listTransactionsQuery.data?.pages.flatMap(
						(page) => page.transactions,
					) ?? []
				}
				selectedTransactions={selectedTransactionIds}
				setSelectedTransactions={setSelectedTransactionIds}
				hasNextPage={listTransactionsQuery.hasNextPage}
				fetchNextPage={listTransactionsQuery.fetchNextPage}
				isFetchingNextPage={listTransactionsQuery.isFetchingNextPage}
			/>
		</PageContainer>
	);
}
