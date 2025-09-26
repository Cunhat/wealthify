import {
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { normalizeSpaces } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

dayjs.extend(customParseFormat);

type ColumnsMatchProps = {
	csvData: Record<string, string>[];
	onSuccess?: () => void;
};

const formSchema = z.object({
	description: z.string().min(1, "Description is required"),
	amount: z.string().min(1, "Amount is required"),
	date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ColumnsMatch({
	csvData,
	onSuccess,
}: ColumnsMatchProps) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description: "",
			amount: "",
			date: "",
		},
	});

	const bulkCreateMutation = useMutation({
		...trpc.transactions.bulkCreateTransactions.mutationOptions(),
		onSuccess: (data) => {
			toast.success(data.message);
			// Invalidate transactions queries to refresh the list
			queryClient.invalidateQueries({
				queryKey: trpc.transactions.listTransactions.queryKey(),
			});
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(`Failed to create transactions: ${error.message}`);
		},
	});

	const selectedColumns = Object.values(form.watch());

	const availableColumns = useMemo(() => {
		return Object.keys(csvData[0]) ?? [];
	}, [csvData]);

	function processMatches(values: FormValues) {
		try {
			const transformedTransactions = csvData.map((row) => {
				const description = row[values.description] || "";
				const dateString = row[values.date];
				const amountString = row[values.amount];

				const parsedDate = dayjs(dateString).toDate();
				if (!parsedDate) {
					throw new Error(`Invalid date format: ${dateString}`);
				}

				let amount = 0;
				let type: "expense" | "income" = "expense";
				if (typeof amountString === "string") {
					const normalized = amountString.replace(/\./g, "").replace(",", ".");
					amount = Number.parseFloat(normalized);

					type = amount < 0 ? "expense" : "income";
					amount = Math.abs(amount);
				}

				if (Number.isNaN(amount) || amount <= 0) {
					throw new Error(`Invalid amount: ${amountString}`);
				}

				const normalizedDescription = normalizeSpaces(description);

				return {
					description: normalizedDescription,
					amount,
					type,
					createdAt: parsedDate,
				};
			});

			bulkCreateMutation.mutate({
				transactions: transformedTransactions,
			});
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error occurred";
			toast.error(`Failed to process CSV data: ${message}`);
		}
	}

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-4"
				onSubmit={form.handleSubmit(processMatches)}
			>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select an account type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{availableColumns.map((column) => (
										<SelectItem
											key={column}
											value={column}
											disabled={selectedColumns.includes(column)}
										>
											{column}
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
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Amount</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select an account type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{availableColumns.map((column) => (
										<SelectItem
											key={column}
											value={column}
											disabled={selectedColumns.includes(column)}
										>
											{column}
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
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Date</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select an account type" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{availableColumns.map((column) => (
										<SelectItem
											key={column}
											value={column}
											disabled={selectedColumns.includes(column)}
										>
											{column}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<Button type="submit" disabled={bulkCreateMutation.isPending}>
						{bulkCreateMutation.isPending
							? "Creating Transactions..."
							: "Create Transactions"}
					</Button>
				</AlertDialogFooter>
			</form>
		</Form>
	);
}
