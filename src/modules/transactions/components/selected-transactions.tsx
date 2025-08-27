import type { Transaction } from "@/lib/schemas";
import DeleteTransactionsDialog from "./delete-transactions-dialog";

type SelectedTransactionsProps = {
	transactions: Transaction[];
	setSelectedTransactions: (transactions: Transaction[]) => void;
};

export default function SelectedTransactions({
	transactions,
	setSelectedTransactions,
}: SelectedTransactionsProps) {
	if (transactions.length === 0) return null;

	return (
		<div className="flex justify-center items-center gap-2">
			<p className="text-sm">{transactions.length} selected</p>
			<DeleteTransactionsDialog
				transactions={transactions}
				setSelectedTransactions={setSelectedTransactions}
			/>
		</div>
	);
}
