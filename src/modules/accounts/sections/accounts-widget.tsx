import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/integrations/trpc/react";
import type { Account } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import AssetsTab from "../components/assets-tab";

export default function AccountsWidget() {
	const trpc = useTRPC();
	const accountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);
	const balanceAccountsQuery = useQuery(
		trpc.accounts.listBalanceAccounts.queryOptions(),
	);

	if (accountsQuery.isLoading || balanceAccountsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const mergedAccounts: Account[] = [
		...(accountsQuery?.data ?? []),
		...(balanceAccountsQuery?.data ?? []),
	];

	return (
		<div className="h-full flex flex-col gap-4">
			<Tabs defaultValue="assets" className="h-full">
				<TabsList className="w-full">
					<TabsTrigger value="assets">Assets</TabsTrigger>
					{/* <TabsTrigger value="debts">Debts</TabsTrigger> */}
				</TabsList>
				<TabsContent value="assets">
					{/* <div className="h-full flex flex-col gap-4">
						<CreateAssetDialog />
						{!mergedAccounts?.length && (
							<div className="h-full flex items-center justify-center">
								<p className="text-foreground">No accounts found...</p>
							</div>
						)}
						<div className="text-2xl font-bold">
							Total Net Worth: {totalNetWorth}
						</div>
						<div className="flex flex-col gap-2">
							{mergedAccounts.map((account) => (
								<div key={account.id}>{account.name}</div>
							))}
						</div>
					</div> */}
					<AssetsTab mergedAccounts={mergedAccounts} />
				</TabsContent>
				{/* <TabsContent value="debts">Debts</TabsContent> */}
			</Tabs>
		</div>
	);
}
