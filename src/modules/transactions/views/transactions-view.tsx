import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";

import NotFound from "@/components/not-found";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import GenerateTransactionsButton from "../components/generate-transactions-button";
import SelectedTransactions from "../components/selected-transactions";
import {
	AppliedFilters,
	TransactionsFilters,
} from "../components/transactions-filters";
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
			accountNames:
				search.account && search.account.length > 0
					? search.account
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

	if (
		listTransactionsQuery.data?.pages.flatMap((page) => page.transactions)
			.length === 0 &&
		Object.keys(search).length === 0
	) {
		return (
			<PageContainer
				title="Transactions"
				actionsComponent={
					<div className="flex gap-2 w-full justify-between">
						<CreateTransaction />
						<GenerateTransactionsButton />
					</div>
				}
			>
				<NotFound message="No transactions found" />
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title="Transactions"
			actionsComponent={
				<div className="flex gap-2 w-full justify-between">
					<GenerateTransactionsButton />
					<SelectedTransactions
						transactions={selectedTransactions}
						setSelectedTransactions={setSelectedTransactionIds}
					/>
					<TransactionsFilters />
					<CreateTransaction />
				</div>
			}
		>
			<AppliedFilters />
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
			{Object.keys(search).length > 0 &&
				!listTransactionsQuery.isLoading &&
				listTransactionsQuery.data?.pages.flatMap((page) => page.transactions)
					.length === 0 && (
					<NotFound message="No transactions found with the current filters" />
				)}
		</PageContainer>
	);
}
