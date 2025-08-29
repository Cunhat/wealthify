import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type DeleteTransactionsDialogProps = {
	transactions: Transaction[];
	setSelectedTransactions: React.Dispatch<React.SetStateAction<Set<string>>>;
};

export default function DeleteTransactionsDialog({
	transactions,
	setSelectedTransactions,
}: DeleteTransactionsDialogProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const [open, setOpen] = useState(false);

	const deleteTransactionsMutation = useMutation({
		...trpc.transactions.deleteTransaction.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.listTransactions.queryKey(),
			});
			toast.success("Transactions deleted successfully");
			setOpen(false);
			setSelectedTransactions(new Set());
		},
		onError: (error) => {
			toast.error("Failed to delete transactions");
			console.error(error);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Trash2 size={16} />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you absolutely sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete your
						transactions.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => setOpen(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={() =>
							deleteTransactionsMutation.mutate({
								transactions: transactions?.map(
									(transaction) => transaction.id,
								),
							})
						}
					>
						{deleteTransactionsMutation.isPending && (
							<Loader2 className="animate-spin" />
						)}
						{deleteTransactionsMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
