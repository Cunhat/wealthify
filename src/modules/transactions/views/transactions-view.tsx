import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";

import NotFound from "@/components/not-found";
import type { Transaction } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import SelectedTransactions from "../components/selected-transactions";
import {
	AppliedFilters,
	TransactionsFilters,
} from "../components/transactions-filters";
import CreateTransaction from "../sections/create-transaction";
import TransactionsTable from "../sections/transactions-table";
import UploadTransactionsFromFile from "../sections/upload-transactions-from-file";

export default function TransactionsView() {
	const [selectedTransactionIds, setSelectedTransactionIds] = useState<
		Set<string>
	>(new Set());

	const trpc = useTRPC();

	const search = useSearch({ from: "/_authed/transactions" });

	const getTransactionsQuery = useQuery(
		trpc.transactions.getTransactions.queryOptions(),
	);

	useEffect(() => {
		if (getTransactionsQuery.isError) {
			toast.error("Error fetching transactions");
		}
	}, [getTransactionsQuery.isError]);

	// Filter transactions based on search params
	const filteredTransactions = useMemo(() => {
		if (!getTransactionsQuery.data) return [];

		let transactions = getTransactionsQuery.data;

		// Filter by category
		if (search.category && search.category.length > 0) {
			transactions = transactions.filter(
				(t: Transaction) =>
					t.category && search.category?.includes(t.category.name),
			);
		}

		// Filter by account
		if (search.account && search.account.length > 0) {
			transactions = transactions.filter(
				(t: Transaction) =>
					t.transactionAccount &&
					search.account?.includes(t.transactionAccount.name),
			);
		}

		return transactions;
	}, [getTransactionsQuery.data, search.category, search.account]);

	const selectedTransactions = useMemo(() => {
		if (!filteredTransactions) return [];

		return filteredTransactions.filter((t: Transaction) =>
			selectedTransactionIds.has(t.id),
		);
	}, [filteredTransactions, selectedTransactionIds]);

	if (getTransactionsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (
		getTransactionsQuery.data?.length === 0 &&
		Object.keys(search).length === 0
	) {
		return (
			<PageContainer
				title="Transactions"
				actionsComponent={
					<div className="flex gap-2 w-full justify-between">
						<CreateTransaction />
						<UploadTransactionsFromFile />
						{/* <GenerateTransactionsButton /> */}
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
			middleSlot={
				<SelectedTransactions
					transactions={selectedTransactions}
					setSelectedTransactions={setSelectedTransactionIds}
				/>
			}
			actionsComponent={
				<div className="flex gap-2 w-full justify-between">
					{/* <GenerateTransactionsButton /> */}

					<TransactionsFilters />
					<UploadTransactionsFromFile />
					<CreateTransaction />
				</div>
			}
		>
			<AppliedFilters />
			<TransactionsTable
				transactions={filteredTransactions}
				selectedTransactions={selectedTransactionIds}
				setSelectedTransactions={setSelectedTransactionIds}
			/>
			{Object.keys(search).length > 0 &&
				!getTransactionsQuery.isLoading &&
				filteredTransactions.length === 0 && (
					<NotFound message="No transactions found with the current filters" />
				)}
		</PageContainer>
	);
}
