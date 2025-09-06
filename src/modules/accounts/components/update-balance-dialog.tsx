import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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
import { useTRPC } from "@/integrations/trpc/react";
import type { Account } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarIcon, Loader, Scale } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type UpdateBalanceDialogProps = {
	account: Account;
};

const formSchema = z.object({
	balance: z.number().min(0, "Balance must be non-negative"),
	date: z.date().max(new Date(), "Date must be in the past"),
});

type FormValues = z.infer<typeof formSchema>;

export default function UpdateBalanceDialog({
	account,
}: UpdateBalanceDialogProps) {
	const [open, setOpen] = useState(false);
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			balance: 0,
			date: dayjs().toDate(),
		},
	});

	const addBalanceUpdateMutation = useMutation({
		...trpc.accounts.updateBalance.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.getAccount.queryKey({ id: account.id }),
			});
			toast.success("Balance updated successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create account");
			console.error(error);
		},
	});

	function onSubmit(values: FormValues) {
		console.log(values);
		addBalanceUpdateMutation.mutate({
			id: account.id,
			balance: values.balance,
			date: values.date,
		});
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Scale size={16} />
					Update Balance
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Balance</DialogTitle>
					<DialogDescription>
						Update the balance of your account.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
						<FormField
							control={form.control}
							name="balance"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Balance</FormLabel>
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
							name="date"
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
												showOutsideDays={false}
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

						<DialogFooter className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={addBalanceUpdateMutation.isPending}
							>
								{addBalanceUpdateMutation.isPending && (
									<Loader className="mr-2 h-4 w-4 animate-spin" />
								)}
								Update
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
