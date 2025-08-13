import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import React from "react";
import CreateAssetDialog from "./create-asset-dialog";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function AccountsWidget() {
	const trpc = useTRPC();
	const accountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);
	const balanceAccountsQuery = useQuery(
		trpc.accounts.listBalanceAccounts.queryOptions(),
	);

	console.log(accountsQuery.data);
	console.log(balanceAccountsQuery.data);

	if (accountsQuery.isLoading || balanceAccountsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const mergedAccounts = [
		...(accountsQuery?.data ?? []),
		...(balanceAccountsQuery?.data ?? []),
	];

	console.log(!mergedAccounts?.length);

	return (
		<div className="h-full flex flex-col gap-4">
			<Tabs defaultValue="assets" className="h-full">
				<TabsList className="w-full">
					<TabsTrigger value="assets">Assets</TabsTrigger>
					{/* <TabsTrigger value="debts">Debts</TabsTrigger> */}
				</TabsList>
				<TabsContent value="assets">
					<div className="h-full flex flex-col gap-4">
						<CreateAssetDialog />
						{!mergedAccounts?.length && (
							<div className="h-full flex items-center justify-center">
								<p className="text-foreground">No accounts found...</p>
							</div>
						)}
						<div className="flex flex-col gap-2">
							{mergedAccounts.map((account) => (
								<div key={account.id}>{account.name}</div>
							))}
						</div>
					</div>
				</TabsContent>
				{/* <TabsContent value="debts">Debts</TabsContent> */}
			</Tabs>
		</div>
	);
}
