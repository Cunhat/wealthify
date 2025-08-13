import type { Account } from "@/lib/schemas";
import CreateAssetDialog from "./create-asset-dialog";

interface AssetsTabProps {
	mergedAccounts: Account[];
}

export default function AssetsTab({ mergedAccounts }: AssetsTabProps) {
	if (!mergedAccounts?.length) {
		return (
			<AssetTabHeader>
				<div className="h-full flex items-center justify-center">
					<p className="text-foreground">No accounts found...</p>
				</div>
			</AssetTabHeader>
		);
	}

	const totalNetWorth = mergedAccounts.reduce(
		(acc, account) => acc + account.balance,
		0,
	);

	return (
		<AssetTabHeader>
			<div className="flex items-center justify-between gap-2">
				<div className="text-xl font-bold">Net Worth:</div>
				<div className="text-xl">{totalNetWorth} €</div>
			</div>
			<div className="flex flex-col gap-2">
				{mergedAccounts.map((account) => (
					<div key={account.id}>{account.name}</div>
				))}
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
