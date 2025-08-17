import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AccountsGroupedByType } from "@/lib/configs/accounts";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/mixins";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

type ListAccountsByTypeProps = {
	accounts: Account[];
	group: AccountsGroupedByType;
};

export default function ListAccountsByType({
	accounts,
	group,
}: ListAccountsByTypeProps) {
	const [expanded, setExpanded] = useState<boolean>(true);

	const accountsInGroup = group.children.flatMap((child) =>
		accounts.filter((account) => account.type === child.type),
	);

	return (
		<div className="flex flex-col gap-4" key={group.name}>
			<div className="flex flex-col">
				<div className="flex items-center gap-1">
					<ChevronRight
						className={cn(
							"size-4 transition-transform duration-200 hover:cursor-pointer",
							expanded && "rotate-90",
						)}
						onClick={() => setExpanded(!expanded)}
					/>
					<h2 className="text-base font-semibold">{group.name}</h2>
				</div>
				<p className="text-sm text-muted-foreground pl-5">
					{group.description}
				</p>
			</div>
			{expanded && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-5">
					{accountsInGroup.map((account) => (
						<AccountCard key={account.id} account={account} />
					))}
				</div>
			)}
		</div>
	);
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
