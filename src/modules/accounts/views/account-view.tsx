import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import type { TransactionAccountWithTransactions } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { CircleAlert } from "lucide-react";
import AccountActions from "../components/account-actions";
import BalanceAccount from "../sections/balance-account";
import TransactionAccount from "../sections/transaction-account";

export default function AccountView() {
	const { accountId } = useParams({ from: "/_authed/accounts/$accountId" });

	const trpc = useTRPC();

	const accountQuery = useQuery(
		trpc.accounts.getAccount.queryOptions({
			id: accountId,
		}),
	);

	if (accountQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (accountQuery.isError) {
		return (
			<PageContainer title="Account Details">
				<div className="flex flex-col gap-2 items-center justify-center h-full">
					<CircleAlert className="w-10 h-10 text-muted-foreground/50" />
					<h1 className="text-xl font-bold">Something went wrong...</h1>
				</div>
			</PageContainer>
		);
	}

	if (accountQuery.data?.isTransactionAccount) {
		return (
			<PageContainer
				title="Account Details"
				actionsComponent={<AccountActions accountId={accountId} />}
			>
				<TransactionAccount
					account={
						accountQuery.data
							?.account as unknown as TransactionAccountWithTransactions
					}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title="Account Details"
			actionsComponent={<AccountActions accountId={accountId} />}
		>
			<BalanceAccount account={accountQuery.data?.account} />
		</PageContainer>
	);
}
