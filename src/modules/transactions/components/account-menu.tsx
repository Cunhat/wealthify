import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import AccountBadge from "./account-badge";

type AccountMenuProps = {
	transaction: Transaction;
};

export default function AccountMenu({ transaction }: AccountMenuProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listAccountsQuery = useQuery({
		...trpc.accounts.listTransactionAccounts.queryOptions(),
	});

	const updateTransactionAccount = useMutation({
		...trpc.transactions.updateTransactionAccount.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction account updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.getTransactions.queryKey(),
			});
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update transaction account");
		},
	});

	const handleAccountChange = (accountId: string) => {
		updateTransactionAccount.mutate({
			transactions: [transaction],
			accountId,
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				{transaction.transactionAccount ? (
					<AccountBadge account={transaction.transactionAccount} />
				) : (
					<span className="text-sm text-muted-foreground">No account...</span>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Accounts</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listAccountsQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listAccountsQuery.data?.map((account) => (
					<DropdownMenuItem
						key={account.id}
						onClick={() => handleAccountChange(account.id)}
						className="flex items-center gap-2"
					>
						<span>{account.name}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
