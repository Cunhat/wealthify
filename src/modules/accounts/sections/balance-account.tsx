import { Separator } from "@/components/ui/separator";
import AccountBadge from "@/modules/transactions/components/account-badge";
import { formatCurrency } from "@/utils/mixins";
import React from "react";

type BalanceAccountProps = {
	account: any; // TODO: fix this
};

export default function BalanceAccount({ account }: BalanceAccountProps) {
	return (
		<div className="h-screen grid grid-cols-[1fr_10px_1fr] overflow-hidden gap-4">
			<div className="h-full flex flex-col gap-2 overflow-y-auto">
				<div className="flex justify-between">
					<AccountBadge account={account} size="lg" />
					<div className="text-lg text-foreground">
						{formatCurrency(Number(account.balance))}
					</div>
				</div>
			</div>
			<Separator orientation="vertical" />
			<div>dsds</div>
		</div>
	);
}
