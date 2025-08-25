import type { Transaction } from "@/lib/schemas";
import { Trash2 } from "lucide-react";

type SelectedTransactionsProps = {
	transactions: Transaction[];
};

export default function SelectedTransactions({
	transactions,
}: SelectedTransactionsProps) {
	if (transactions.length === 0) return null;

	return (
		<div className="absolute bottom-0 left-0 right-0 z-10 flex justify-center items-center">
			<div className="flex items-center gap-2 bg-background p-2 rounded-md shadow-lg border border-border">
				<Trash2 size={16} />
				<span>{transactions.length} transactions selected</span>
			</div>
		</div>
	);
}
