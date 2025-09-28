import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/mixins";
import type { BalanceAccountWithHistory } from "@/lib/schemas";
import { capitalizeFirstLetter } from "@/lib/utils";
import AccountBadge from "@/modules/transactions/components/account-badge";
import dayjs from "dayjs";
import UpdateBalanceDialog from "../components/update-balance-dialog";

type BalanceAccountProps = {
	account: BalanceAccountWithHistory;
};

export default function BalanceAccount({ account }: BalanceAccountProps) {
	const months = Array.from({ length: 12 }, (_, i) => {
		const monthIndex = (11 - i) % 12; // Start from December (11) and go backwards
		return dayjs().month(monthIndex).format("MMMM").toLowerCase();
	});

	return (
		<div className="h-screen grid grid-cols-[2fr_10px_1fr] overflow-hidden gap-4">
			<div className="h-full flex flex-col gap-4 overflow-y-auto">
				<div className="flex justify-between">
					<AccountBadge account={account} size="lg" />
					<div className="text-lg text-foreground">
						{formatCurrency(Number(account.balance))}
					</div>
				</div>
			</div>
			<Separator orientation="vertical" />
			<div className="h-full flex flex-col gap-4 overflow-y-auto">
				<div className="flex justify-between flex-wrap gap-2">
					<h2 className="text-base font-medium">Balance History</h2>
					<UpdateBalanceDialog account={account} />
				</div>
				<div className="flex flex-col gap-4">
					{account?.history?.map((history) => (
						<div key={history.id} className="flex flex-col gap-3">
							<h1 className="text-base font-medium">{history.year}</h1>
							<div className="flex flex-col gap-3">
								{months.map((month) => {
									const value = history[month as keyof typeof history];

									if (value === null || value === undefined) {
										return null;
									}

									return (
										<div
											className="flex justify-between"
											key={month + history.year}
										>
											<h2>{capitalizeFirstLetter(month)}</h2>
											<p>{formatCurrency(Number(value))}</p>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
