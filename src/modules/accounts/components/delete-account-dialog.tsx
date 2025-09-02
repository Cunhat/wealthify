import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader } from "lucide-react";
import { toast } from "sonner";

type DeleteAccountDialogProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	accountId: string;
	isTransactionAccount: boolean;
};

export default function DeleteAccountDialog({
	open,
	setOpen,
	accountId,
	isTransactionAccount,
}: DeleteAccountDialogProps) {
	const navigate = useNavigate();
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const deleteAccountMutation = useMutation({
		...trpc.accounts.deleteAccount.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listAccounts.queryKey(),
			});
			toast.success("Account deleted successfully");
			setOpen(false);
			navigate({ to: "/accounts" });
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to delete account");
		},
	});

	function onDeleteConfirm() {
		deleteAccountMutation.mutate({ id: accountId, isTransactionAccount });
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Are you absolutely sure?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will permanently delete your
						account and all associated data.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={deleteAccountMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={onDeleteConfirm}
						disabled={deleteAccountMutation.isPending}
					>
						{deleteAccountMutation.isPending && (
							<Loader className="mr-2 h-4 w-4 animate-spin" />
						)}
						{deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
