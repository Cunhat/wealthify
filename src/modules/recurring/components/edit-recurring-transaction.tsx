import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { RecurringTransaction } from "@/lib/schemas";
import EditRecurringTransactionForm from "./edit-recurring-transaction-form";

interface EditRecurringTransactionProps {
	transaction: RecurringTransaction;
	open: boolean;
	setOpen: (open: boolean) => void;
}

export default function EditRecurringTransaction({
	transaction,
	open,
	setOpen,
}: EditRecurringTransactionProps) {
	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Edit Recurring Transaction</DialogTitle>
					<DialogDescription>
						Update the details of your recurring transaction.
					</DialogDescription>
				</DialogHeader>
				<EditRecurringTransactionForm
					transaction={transaction}
					setOpen={setOpen}
				/>
			</DialogContent>
		</Dialog>
	);
}
