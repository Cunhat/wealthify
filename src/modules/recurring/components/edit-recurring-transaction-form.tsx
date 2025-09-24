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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import type { RecurringTransaction } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import {
	type FrequencyMonths,
	frequencyMonthsSchema,
	frequencyOptions,
} from "./utils";

const formSchema = z.object({
	amount: z.number().min(1, "Amount is required"),
	description: z.string().min(1, "Description is required"),
	firstOccurrence: z.date(),
	frequency: frequencyMonthsSchema,
	category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface EditRecurringTransactionFormProps {
	transaction: RecurringTransaction;
	setOpen: (open: boolean) => void;
}

export default function EditRecurringTransactionForm({
	transaction,
	setOpen,
}: EditRecurringTransactionFormProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const categoriesQuery = useQuery({
		...trpc.categories.listCategories.queryOptions(),
	});

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			amount: Number(transaction.amount),
			description: transaction.description || "",
			firstOccurrence: new Date(transaction.firstOccurrence),
			frequency: transaction.frequency as FrequencyMonths,
			category: transaction.category?.id || "",
		},
	});

	useEffect(() => {
		if (transaction) {
			form.reset({
				amount: Number(transaction.amount),
				description: transaction.description || "",
				firstOccurrence: new Date(transaction.firstOccurrence),
				frequency: transaction.frequency as FrequencyMonths,
				category: transaction.category?.id || "",
			});
		}
	}, [transaction, form]);

	const updateRecurringTransactionMutation = useMutation({
		...trpc.recurring.updateRecurringTransaction.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.recurring.listRecurringTransactions.queryKey(),
			});

			toast.success("Recurring transaction updated successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to update recurring transaction");
			console.error(error);
		},
	});

	function onSubmit(values: FormValues) {
		updateRecurringTransactionMutation.mutate({
			id: transaction.id,
			amount: values.amount,
			description: values.description || undefined,
			firstOccurrence: values.firstOccurrence,
			frequency: values.frequency,
			category: values.category,
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter recurring transaction description"
									{...field}
								/>
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

				<FormField
					control={form.control}
					name="frequency"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Frequency</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select frequency" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{frequencyOptions.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="firstOccurrence"
					render={({ field }) => (
						<FormItem className="flex flex-col">
							<FormLabel>First Occurrence</FormLabel>
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
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						variant="outline"
						type="button"
						onClick={() => setOpen(false)}
						disabled={updateRecurringTransactionMutation.isPending}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						disabled={updateRecurringTransactionMutation.isPending}
					>
						{updateRecurringTransactionMutation.isPending
							? "Updating..."
							: "Update"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
