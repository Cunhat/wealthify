import type { Transaction } from "@/lib/schemas";
import BulkCategories from "./bulk-categories";
import DeleteTransactionsDialog from "./delete-transactions-dialog";

type SelectedTransactionsProps = {
	transactions: Transaction[];
	setSelectedTransactions: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export default function SelectedTransactions({
	transactions,
	setSelectedTransactions,
}: SelectedTransactionsProps) {
	if (transactions.length === 0) return null;

	return (
		<div className="flex justify-center items-center gap-2">
			<p className="text-sm">{transactions.length} selected</p>
			<BulkCategories transactions={transactions} />
			<DeleteTransactionsDialog
				transactions={transactions}
				setSelectedTransactions={setSelectedTransactions}
			/>
		</div>
	);
}
