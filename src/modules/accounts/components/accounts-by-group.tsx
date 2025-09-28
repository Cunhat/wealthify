import type {
	AccountType,
	AccountsGroupedByType,
} from "@/lib/configs/accounts";
import { formatCurrency } from "@/lib/mixins";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

type AccountsByGroupProps = {
	accountType: AccountsGroupedByType;
	accountsList: Account[];
};

export default function AccountsByGroup({
	accountType,
	accountsList,
}: AccountsByGroupProps) {
	const [isOpen, setIsOpen] = useState(true);
	const accountTypes = accountType.children.map((acc) => acc.type);

	const accounts = accountsList.filter((account) =>
		accountTypes.includes(account.type as AccountType),
	);

	if (!accounts.length) {
		return null;
	}

	const totalBalance = accounts.reduce(
		(acc, account) => acc + Number(account.balance),
		0,
	);

	return (
		<div className="flex flex-col gap-4">
			<div
				className="flex gap-1 items-center cursor-pointer"
				onClick={() => setIsOpen(!isOpen)}
			>
				<ChevronRight size={16} className={cn(isOpen ? "rotate-90" : "")} />
				<p className="text-base font-semibold">{accountType.name}</p>
				{!isOpen && (
					<p className="text-base ml-auto">{formatCurrency(totalBalance)}</p>
				)}
			</div>
			{isOpen && (
				<div className="flex flex-col gap-4 pl-5">
					{accounts.map((account) => {
						const childMeta = accountType.children.find(
							(type) => account.type === type.type,
						);

						return (
							<div
								className="flex justify-between items-center"
								key={account.id}
							>
								<div className="flex items-center gap-2">
									{childMeta ? (
										<div
											className={cn(
												"h-7 w-7 rounded-full flex items-center justify-center",
												childMeta.iconBg,
												childMeta.iconFg,
											)}
										>
											<childMeta.icon className="h-4 w-4" />
										</div>
									) : null}
									<div className="flex flex-col">
										<p className="text-sm text-foreground font-medium">
											{account.name}
										</p>
										<p className="text-xs text-muted-foreground ">
											{childMeta?.label ?? account.type}
										</p>
									</div>
								</div>
								<p className="text-base text-foreground">
									{formatCurrency(Number(account.balance))}
								</p>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
