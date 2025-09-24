import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import type { RecurringTransaction } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditRecurringTransaction from "../components/edit-recurring-transaction";

type RecurringTransactionMenuActionsProps = {
	transaction: RecurringTransaction;
};

export default function RecurringTransactionMenuActions({
	transaction,
}: RecurringTransactionMenuActionsProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const deleteRecurringTransactionMutation = useMutation({
		...trpc.recurring.deleteRecurringTransaction.mutationOptions(),
		onSuccess: () => {
			toast.success("Recurring transaction deleted successfully");
			queryClient.invalidateQueries({
				queryKey: trpc.recurring.listRecurringTransactions.queryKey(),
			});
		},
		onError: () => {
			toast.error("Failed to delete recurring transaction");
		},
	});

	const handleDeleteRecurringTransaction = () => {
		deleteRecurringTransactionMutation.mutate({ id: transaction.id });
	};

	const handleEditClick = () => {
		setEditDialogOpen(true);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger>
					<EllipsisVertical size={16} className="text-muted-foreground" />
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={handleEditClick}>
						<Pencil size={16} />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						className="text-destructive focus:text-destructive"
						onClick={handleDeleteRecurringTransaction}
					>
						<Trash2 size={16} className="text-destructive" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<EditRecurringTransaction
				transaction={transaction}
				open={editDialogOpen}
				setOpen={setEditDialogOpen}
			/>
		</>
	);
}
