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
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { AccountTypeGroups } from "@/lib/configs/accounts";
import type { Account } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const editAccountSchema = z.object({
	name: z.string().min(1, "Account name is required"),
	initialBalance: z.number().min(0, "Initial balance must be non-negative"),
	type: z.string().min(1, "Account type is required"),
});

type EditAccountFormType = z.infer<typeof editAccountSchema>;

type EditAccountDialogProps = {
	editDialogOpen: boolean;
	setEditDialogOpen: (open: boolean) => void;
	account: Account;
	isTransactionAccount: boolean;
};

export default function EditAccountDialog({
	editDialogOpen,
	setEditDialogOpen,
	account,
	isTransactionAccount,
}: EditAccountDialogProps) {
	const queryClient = useQueryClient();
	const trpc = useTRPC();

	const form = useForm<EditAccountFormType>({
		resolver: zodResolver(editAccountSchema),
		values: {
			name: account?.name || "",
			initialBalance: Number.parseFloat(account.initialBalance || "0"),
			type: account.type,
		},
	});

	const updateAccountMutation = useMutation({
		...trpc.accounts.updateAccount.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listAccounts.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.getAccount.queryKey({ id: account.id }),
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
			id: account.id,
			isTransactionAccount,
			...values,
		});
	}

	return (
		<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Account</DialogTitle>
					<DialogDescription>
						Make changes to your account here. The account main type cannot be
						changed.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onEditSubmit)}
						className="space-y-8"
						id="edit-account-form"
					>
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Account Type</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Select an account type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{AccountTypeGroups.map((accountGroup) => (
												<SelectGroup key={accountGroup.main_type}>
													<SelectLabel>{accountGroup.name}</SelectLabel>
													{accountGroup.children.map((account) => (
														<SelectItem key={account.type} value={account.type}>
															{account.label}
														</SelectItem>
													))}
												</SelectGroup>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
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
	);
}
