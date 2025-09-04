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
import { AccountTypeGroups } from "@/lib/configs/accounts";
import { useQuery } from "@tanstack/react-query";
import { Edit, EllipsisVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import DeleteAccountDialog from "./delete-account-dialog";
import EditAccountDialog from "./edit-account-dialog";

type AccountActionsProps = {
	accountId: string;
};

export default function AccountActions({ accountId }: AccountActionsProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const trpc = useTRPC();

	const accountQuery = useQuery({
		...trpc.accounts.getAccount.queryOptions({ id: accountId }),
	});

	if (accountQuery.isLoading) {
		return (
			<Button variant="ghost" size="sm" disabled>
				<EllipsisVertical className="size-4" />
			</Button>
		);
	}

	if (!accountQuery.data?.account) {
		return null;
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="sm">
						<EllipsisVertical className="size-4" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Account Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" />
						Edit Account
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setDeleteDialogOpen(true)}
						className="text-destructive focus:text-destructive"
					>
						<Trash2 className="h-4 w-4" color="red" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Account Dialog */}
			<EditAccountDialog
				editDialogOpen={editDialogOpen}
				setEditDialogOpen={setEditDialogOpen}
				account={accountQuery.data?.account}
				isTransactionAccount={accountQuery.data?.isTransactionAccount || false}
			/>

			<DeleteAccountDialog
				accountId={accountId}
				isTransactionAccount={accountQuery.data?.isTransactionAccount || false}
				open={deleteDialogOpen}
				setOpen={setDeleteDialogOpen}
			/>
		</>
	);
}
