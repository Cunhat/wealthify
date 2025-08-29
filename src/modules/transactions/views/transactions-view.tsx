import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";

import type { Transaction } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import GenerateTransactionsButton from "../components/generate-transactions-button";
import SelectedTransactions from "../components/selected-transactions";
import CreateTransaction from "../sections/create-transaction";
import TransactionsTable from "../sections/transactions-table";

export default function TransactionsView() {
	const [selectedTransactionIds, setSelectedTransactionIds] = useState<
		Set<string>
	>(new Set());

	const trpc = useTRPC();

	const listTransactionsQuery = useQuery({
		...trpc.transactions.listTransactions.queryOptions(),
	});

	useEffect(() => {
		if (listTransactionsQuery.isError) {
			toast.error("Error fetching transactions");
		}
	}, [listTransactionsQuery.isError]);

	useEffect(() => {
		console.log("selectedTransactionIds", selectedTransactionIds);
	}, [selectedTransactionIds]);

	const selectedTransactions = useMemo(() => {
		if (!listTransactionsQuery.data) return [];

		return listTransactionsQuery.data.filter((t) =>
			selectedTransactionIds.has(t.id),
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
					<GenerateTransactionsButton />
					<SelectedTransactions
						transactions={selectedTransactions}
						setSelectedTransactions={setSelectedTransactionIds}
					/>
					<CreateTransaction />
				</div>
			}
		>
			<TransactionsTable
				transactions={listTransactionsQuery.data ?? []}
				selectedTransactions={selectedTransactionIds}
				setSelectedTransactions={setSelectedTransactionIds}
			/>
		</PageContainer>
	);
}
