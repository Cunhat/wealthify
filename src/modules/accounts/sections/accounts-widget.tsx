import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/integrations/trpc/react";
import type { Account } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import AssetsTab from "../components/assets-tab";

export default function AccountsWidget() {
	const trpc = useTRPC();
	const accountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);
	const balanceAccountsQuery = useQuery(
		trpc.accounts.listBalanceAccounts.queryOptions(),
	);

	useEffect(() => {
		if (accountsQuery.isError || balanceAccountsQuery.isError) {
			toast.error("Error fetching accounts");
		}
	}, [accountsQuery.isError, balanceAccountsQuery.isError]);

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
					<AssetsTab mergedAccounts={mergedAccounts} />
				</TabsContent>
				{/* <TabsContent value="debts">Debts</TabsContent> */}
			</Tabs>
		</div>
	);
}
