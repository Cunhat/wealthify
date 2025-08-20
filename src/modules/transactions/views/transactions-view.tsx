import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import CreateTransaction from "../sections/create-transaction";

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
			actionsComponent={<CreateTransaction />}
		>
			<div className="flex flex-col gap-4">
				{listTransactionsQuery.data?.map((transaction) => (
					<div className="grid grid-cols-12 gap-4" key={transaction.id}>
						<div className="col-span-2">{transaction.description}</div>
						<div className="col-span-2">{transaction.amount}</div>
						<div className="col-span-2">
							{transaction.createdAt?.toLocaleDateString()}
						</div>
						{/* <div className="col-span-2">{transaction.category}</div> */}
						{/* <div className="col-span-2">{transaction.transactionAccount}</div> */}
					</div>
				))}
			</div>
		</PageContainer>
	);
}
