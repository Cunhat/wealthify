import { Button } from "@/components/ui/button";
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

type BulkAccountsProps = {
	transactions: Transaction[];
};

export default function BulkAccounts({ transactions }: BulkAccountsProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const listTransactionAccountsQuery = useQuery({
		...trpc.accounts.listTransactionAccounts.queryOptions(),
	});

	if (listTransactionAccountsQuery.isError) {
		return null;
	}

	const updateTransactionAccount = useMutation({
		...trpc.transactions.updateTransactionAccount.mutationOptions(),
		onSuccess: () => {
			toast.success("Transaction account updated");
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.listTransactions.queryKey(),
			});
		},
		onError: (error) => {
			console.error(error);
			toast.error("Failed to update transaction account");
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Accounts</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Accounts</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{listTransactionAccountsQuery.isLoading && (
					<DropdownMenuItem>Loading...</DropdownMenuItem>
				)}
				{listTransactionAccountsQuery.data?.map((account) => {
					return (
						<DropdownMenuItem
							className="flex items-center gap-2"
							key={account.id}
							onClick={() => {
								updateTransactionAccount.mutate({
									transactions: transactions,
									accountId: account.id,
								});
							}}
						>
							<AccountBadge account={account} />
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
