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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit, EllipsisVertical, Loader, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import DeleteAccountDialog from "./delete-account-dialog";

type AccountActionsProps = {
	accountId: string;
};

const editAccountSchema = z.object({
	name: z.string().min(1, "Account name is required"),
	balance: z.number().min(0, "Balance must be non-negative"),
	initialBalance: z.number().min(0, "Initial balance must be non-negative"),
});

type EditAccountFormType = z.infer<typeof editAccountSchema>;

export default function AccountActions({ accountId }: AccountActionsProps) {
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const accountQuery = useQuery({
		...trpc.accounts.getAccount.queryOptions({ id: accountId }),
	});

	const form = useForm<EditAccountFormType>({
		resolver: zodResolver(editAccountSchema),
		values: {
			name: accountQuery.data?.account.name || "",
			balance: Number.parseFloat(accountQuery.data?.account.balance || "0"),
			initialBalance: Number.parseFloat(
				accountQuery.data?.account.initialBalance || "0",
			),
		},
	});

	const updateAccountMutation = useMutation({
		...trpc.accounts.updateAccount.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listAccounts.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.getAccount.queryKey({ id: accountId }),
			});
			toast.success("Account updated successfully");
			setEditDialogOpen(false);
		},
		onError: () => {
			toast.error("Failed to update account");
		},
	});

	function onEditSubmit(values: EditAccountFormType) {
		updateAccountMutation.mutate({
			id: accountId,
			...values,
		});
	}

	if (accountQuery.isLoading) {
		return (
			<Button variant="ghost" size="sm" disabled>
				<EllipsisVertical className="size-4" />
			</Button>
		);
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
			<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Account</DialogTitle>
						<DialogDescription>
							Make changes to your account here. The account type cannot be
							changed.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onEditSubmit)}
							className="space-y-4"
							id="edit-account-form"
						>
							{/* Account Type - Disabled */}
							<div className="space-y-2">
								<label
									className="text-sm font-medium text-muted-foreground"
									htmlFor="account-type-disabled"
								>
									Account Type
								</label>
								<Select disabled value={accountQuery.data?.account.type}>
									<SelectTrigger
										className="w-full opacity-50"
										id="account-type-disabled"
									>
										<SelectValue placeholder={accountTypeLabel} />
									</SelectTrigger>
								</Select>
								<p className="text-xs text-muted-foreground">
									Account type cannot be changed after creation
								</p>
							</div>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Account Name</FormLabel>
										<FormControl>
											<Input placeholder="Account Name" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="balance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Current Balance</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00 €"
												pattern="^\d*\.?\d{0,2}$"
												className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												{...field}
												onChange={(e) => {
													const value = Number.parseFloat(
														Number.parseFloat(e.target.value).toFixed(2),
													);
													field.onChange(Number.isNaN(value) ? 0 : value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="initialBalance"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Initial Balance</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00 €"
												pattern="^\d*\.?\d{0,2}$"
												className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
												{...field}
												onChange={(e) => {
													const value = Number.parseFloat(
														Number.parseFloat(e.target.value).toFixed(2),
													);
													field.onChange(Number.isNaN(value) ? 0 : value);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
					<DialogFooter className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setEditDialogOpen(false)}
							disabled={updateAccountMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							form="edit-account-form"
							disabled={updateAccountMutation.isPending}
						>
							{updateAccountMutation.isPending && (
								<Loader className="mr-2 h-4 w-4 animate-spin" />
							)}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<DeleteAccountDialog
				accountId={accountId}
				isTransactionAccount={accountQuery.data?.isTransactionAccount || false}
				open={deleteDialogOpen}
				setOpen={setDeleteDialogOpen}
			/>
		</>
	);
}
