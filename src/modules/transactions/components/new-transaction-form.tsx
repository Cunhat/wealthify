import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogFooter } from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";

const formSchema = z.object({
	amount: z.number().min(1, "Amount is required"),
	// .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid amount (e.g., 10.50)"),
	description: z.string().min(1, "Description is required"),
	transactionAccount: z.string().min(1, "Transaction account is required"),
	category: z.string().min(1, "Category is required"),
	type: z.enum(["expense", "income"]),
	createdAt: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewTransactionFormProps {
	setOpen: (open: boolean) => void;
}

export default function NewTransactionForm({
	setOpen,
}: NewTransactionFormProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const accountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: 0,
			description: "",
			transactionAccount: "",
			category: "",
			type: "expense",
			createdAt: dayjs().toDate(),
		},
	});

	const createTransactionMutation = useMutation({
		...trpc.transactions.createTransaction.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.listTransactions.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listTransactionAccounts.queryKey(),
			});
			toast.success("Transaction created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create transaction");
			console.error(error);
		},
	});

	function onSubmit(values: FormValues) {
		createTransactionMutation.mutate({
			amount: values.amount,
			description: values.description || undefined,
			transactionAccount: values.transactionAccount || undefined,
			category: values.category || undefined,
			type: values.type,
			createdAt: values.createdAt || undefined,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Type</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="expense">Expense</SelectItem>
									<SelectItem value="income">Income</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Input placeholder="Enter transaction description" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Amount</FormLabel>
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
					name="transactionAccount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Transaction Account</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select an account" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{AccountTypeGroups.map((group) => {
										const accountTypes = group.children.map(
											(elem) => elem.type,
										);

										const accountsInGroup = accountsQuery.data?.filter(
											(account) => accountTypes.includes(account.type),
										);

										if (!accountsInGroup) return null;

										return (
											<SelectGroup key={group.name}>
												<SelectLabel>{group.name}</SelectLabel>
												{accountsInGroup?.map((account) => (
													<SelectItem key={account.id} value={account.id}>
														{account.name}
													</SelectItem>
												))}
											</SelectGroup>
										);
									})}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="createdAt"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>Date</FormLabel>
							<Popover modal>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											type="button"
											variant={"outline"}
											className={cn(
												"w-full pl-3 text-left font-normal",
												!field.value && "text-muted-foreground",
											)}
										>
											{field.value ? (
												dayjs(field.value).format("DD/MM/YYYY")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="category"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select a category" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{categoriesQuery.data?.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											<div className="flex items-center gap-2">
												<span>{category.icon}</span>
												<span>{category.name}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => {
							form.reset();
							setOpen(false);
						}}
						disabled={createTransactionMutation.isPending}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={createTransactionMutation.isPending}>
						{createTransactionMutation.isPending ? "Creating..." : "Create"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
