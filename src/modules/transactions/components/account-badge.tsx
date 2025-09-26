import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const SIZES = {
	default: {
		outerIcon: "h-6 w-6",
		innerIcon: "h-3 w-3",
		text: "text-sm",
	},
	lg: {
		outerIcon: "h-8 w-8",
		innerIcon: "h-4 w-4",
		text: "text-base",
	},
};

type AccountBadgeProps = {
	account: Account | null;
	size?: keyof typeof SIZES;
};

export default function AccountBadge({
	account,
	size = "default",
}: AccountBadgeProps) {
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
					"rounded-full flex items-center justify-center",
					SIZES[size].outerIcon,
					AccountInfo?.iconBg,
				)}
			>
				<AccountInfo.icon
					className={cn(SIZES[size].innerIcon, AccountInfo?.iconFg)}
				/>
			</div>
			<p className={SIZES[size].text}>{account.name}</p>
		</div>
	);
}
