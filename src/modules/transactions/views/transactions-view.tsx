import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import GenerateTransactionsButton from "../components/generate-transactions-button";
import CreateTransaction from "../sections/create-transaction";
import TransactionsTable from "../sections/transactions-table";

export default function TransactionsView() {
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
		if (listTransactionsQuery.data) {
			console.log(listTransactionsQuery.data);
		}
	}, [listTransactionsQuery.data]);

	if (listTransactionsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<PageContainer
			title="Transactions"
			actionsComponent={
				<div className="flex gap-2">
					<GenerateTransactionsButton />
					<CreateTransaction />
				</div>
			}
		>
			<TransactionsTable transactions={listTransactionsQuery.data ?? []} />
		</PageContainer>
	);
}
