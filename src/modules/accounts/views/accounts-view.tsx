import PageContainer from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/mixins";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

function getAccountIcon(accountType: string) {
	for (const group of AccountTypeGroups) {
		const childMeta = group.children.find(
			(child) => child.type === accountType,
		);
		if (childMeta) {
			return {
				icon: childMeta.icon,
				iconBg: childMeta.iconBg,
				iconFg: childMeta.iconFg,
				label: childMeta.label,
			};
		}
	}
	return null;
}

function AccountCard({ account }: { account: Account }) {
	const accountMeta = getAccountIcon(account.type);

	return (
		<Link
			to="/accounts/$accountId"
			params={{ accountId: account.id }}
			className="block group"
		>
			<Card className="h-full gap-0 transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group-hover:border-primary/50">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							{accountMeta && (
								<div
									className={cn(
										"h-10 w-10 rounded-full flex items-center justify-center",
										accountMeta.iconBg,
										accountMeta.iconFg,
									)}
								>
									<accountMeta.icon className="h-5 w-5" />
								</div>
							)}
							<div>
								<CardTitle className="text-base">{account.name}</CardTitle>
								<p className="text-sm text-muted-foreground">
									{accountMeta?.label ?? account.type}
								</p>
							</div>
						</div>
					</div>
				</CardHeader>
				<CardContent className="pt-0">
					<div className="flex justify-end items-center">
						<span className="text-lg font-semibold">
							{formatCurrency(Number(account.balance))}
						</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}

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
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{accounts.map((account) => (
					<AccountCard key={account.id} account={account} />
				))}
			</div>
		</PageContainer>
	);
}
