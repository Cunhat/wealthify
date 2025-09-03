import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit, EllipsisVertical, Loader, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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

	// Find the account type label for display
	const accountTypeLabel =
		AccountTypeGroups.flatMap((group) => group.children).find(
			(account) => account.type === accountQuery.data?.account.type,
		)?.label || accountQuery.data?.account.type;

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
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuSeparator />

					<DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
						<Edit className="h-4 w-4" />
						Edit Account
					</DropdownMenuItem>
					<DropdownMenuSeparator />
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
