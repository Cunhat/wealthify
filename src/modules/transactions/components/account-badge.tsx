import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export default function AccountBadge({ account }: { account: Account | null }) {
	if (!account) {
		return null;
	}

	const AccountInfo = AccountTypeGroups.flatMap((elem) => elem.children).find(
		(child) => child.type === account.type,
	);

	if (!AccountInfo) {
		return null;
	}

	return (
		<div className="flex gap-1 items-center">
			<div
				className={cn(
					"h-6 w-6 rounded-full flex items-center justify-center",
					AccountInfo?.iconBg,
					AccountInfo?.iconFg,
				)}
			>
				<AccountInfo.icon className="h-3 w-3" />
			</div>
			<p className="text-sm">{account.name}</p>
		</div>
	);
}
