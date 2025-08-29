import NotFound from "@/components/not-found";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { formatCurrency } from "@/utils/mixins";
import AccountsByGroup from "./accounts-by-group";
import CreateAssetDialog from "./create-asset-dialog";

interface AssetsTabProps {
	mergedAccounts: Account[];
}

export default function AssetsTab({ mergedAccounts }: AssetsTabProps) {
	if (!mergedAccounts?.length) {
		return (
			<AssetTabHeader>
				<NotFound message="No accounts found..." />
			</AssetTabHeader>
		);
	}

	const totalNetWorth = mergedAccounts.reduce(
		(acc, account) => acc + Number(account.balance),
		0,
	);

	return (
		<AssetTabHeader>
			<div className="flex items-center justify-between gap-2">
				<div className="text-lg font-semibold text-foreground">Net Worth</div>
				<div className="text-lg text-foreground">
					{formatCurrency(totalNetWorth)}
				</div>
			</div>
			<div className="flex flex-col gap-4">
				{AccountTypeGroups.map((accountType) => {
					return (
						<AccountsByGroup
							key={accountType.name}
							accountType={accountType}
							accountsList={mergedAccounts}
						/>
					);
				})}
			</div>
		</AssetTabHeader>
	);
}

function AssetTabHeader({ children }: { children: React.ReactNode }) {
	return (
		<div className="h-full flex flex-col gap-4">
			<CreateAssetDialog />
			{children}
		</div>
	);
}
