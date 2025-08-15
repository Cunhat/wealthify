import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import AssetsTab from "../components/assets-tab";

export default function AccountsWidget() {
	const trpc = useTRPC();

	const accountsQuery = useQuery(trpc.accounts.listAccounts.queryOptions());

	useEffect(() => {
		if (accountsQuery.isError) {
			toast.error("Error fetching accounts");
		}
	}, [accountsQuery.isError]);

	if (accountsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="h-full flex flex-col gap-4 overflow-y-auto">
			<Tabs defaultValue="assets" className="h-full">
				<TabsList className="w-full">
					<TabsTrigger value="assets">Assets</TabsTrigger>
					{/* <TabsTrigger value="debts">Debts</TabsTrigger> */}
				</TabsList>
				<TabsContent value="assets">
					<AssetsTab mergedAccounts={accountsQuery.data ?? []} />
				</TabsContent>
				{/* <TabsContent value="debts">Debts</TabsContent> */}
			</Tabs>
		</div>
	);
}
