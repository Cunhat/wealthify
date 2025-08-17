import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import ListAccountsByType from "../sections/list-accounts-by-type";

export default function AccountsView() {
	const trpc = useTRPC();
	const accountsQuery = useQuery(trpc.accounts.listAccounts.queryOptions());

	useEffect(() => {
		if (accountsQuery.isError) {
			toast.error("Error fetching accounts");
		}
	}, [accountsQuery.isError]);

	if (accountsQuery.isLoading) {
		return (
			<PageContainer title="Accounts">
				<div className="flex h-full text-center">
					<p className="text-muted-foreground mb-4">Loading accounts...</p>
				</div>
			</PageContainer>
		);
	}

	if (accountsQuery.isError) {
		return (
			<PageContainer title="Accounts">
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						Failed to load accounts. Please try again.
					</p>
				</div>
			</PageContainer>
		);
	}

	const accounts = accountsQuery.data ?? [];

	if (accounts.length === 0) {
		return (
			<PageContainer title="Accounts">
				<div className="flex h-full text-center">
					<p className="text-muted-foreground mb-4">
						You don't have any accounts yet.
					</p>
					<p className="text-sm text-muted-foreground">
						Create your first account to get started.
					</p>
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer title="Accounts">
			<div className="flex flex-col gap-4 overflow-y-auto">
				{AccountTypeGroups.map((group) => (
					<ListAccountsByType
						key={group.name}
						accounts={accounts}
						group={group}
					/>
				))}
			</div>
		</PageContainer>
	);
}
