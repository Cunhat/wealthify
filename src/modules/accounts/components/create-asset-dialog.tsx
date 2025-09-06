import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogClose,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarIcon, Loader, PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function CreateAssetDialog() {
	const [open, setOpen] = useState(false);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost">
					<PlusIcon />
					New Asset
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Asset</DialogTitle>
					<DialogDescription>
						Create a new account for tracking your assets.
					</DialogDescription>
				</DialogHeader>
				<CreateAssetForm setOpen={() => setOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}

const formSchema = z.union([
	z.object({
		main_type: z.literal("transactional"),
		type: z.string().min(1, "Account type is required"),
		balance: z.number().min(0, "Balance must be non-negative"),
		initial_balance: z.number().min(0, "Initial balance must be non-negative"),
		name: z.string().min(1, "Account name is required"),
	}),
	z.object({
		main_type: z.literal("balance"),
		type: z.string().min(1, "Account type is required"),
		balance: z.number().min(0, "Balance must be non-negative"),
		initial_balance: z.number().min(0, "Initial balance must be non-negative"),
		initialBalanceDate: z
			.date()
			.max(new Date(), "Initial balance date must be in the past"),
		name: z.string().min(1, "Account name is required"),
	}),
]);

function CreateAssetForm({ setOpen }: { setOpen: (open: boolean) => void }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			main_type: "transactional",
			type: "",
			balance: 0,
			initial_balance: 0,
			name: "",
		},
	});

	const createAssetMutation = useMutation({
		...trpc.accounts.createAccount.mutationOptions(),
		onSuccess: () => {
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.accounts.listAccounts.queryKey(),
			});
			toast.success("Account created successfully");
			setOpen(false);
		},
		onError: (error) => {
			toast.error("Failed to create account");
			console.error(error);
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		createAssetMutation.mutate(values);
	}

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
					id="create-asset-form"
				>
					<FormField
						control={form.control}
						name="main_type"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormControl>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex gap-4"
									>
										<FormItem className="flex flex-1 items-center gap-3">
											<FormControl>
												<RadioGroupItem value="transactional" />
											</FormControl>
											<FormLabel className="font-normal">
												Transactional
											</FormLabel>
										</FormItem>
										<FormItem className="flex flex-1 items-center gap-3">
											<FormControl>
												<RadioGroupItem value="balance" />
											</FormControl>
											<FormLabel className="font-normal">Balance</FormLabel>
										</FormItem>
									</RadioGroup>
								</FormControl>

								<FormMessage />
								{field.value === "balance" ? (
									<FormDescription>
										<strong>Balance</strong> accounts are ideal for accounts
										that you only want to control the balance variance.
									</FormDescription>
								) : (
									<FormDescription>
										<strong>Transactional</strong> accounts are ideal for
										accounts that you want to control every transaction.
									</FormDescription>
								)}
							</FormItem>
						)}
					/>

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
					{form.watch("main_type") === "balance" && (
						<FormField
							control={form.control}
							name="initialBalanceDate"
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
					)}
					<DialogFooter className="flex gap-2">
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button form="create-asset-form" type="submit">
							{createAssetMutation.isPending && (
								<Loader className="h-4 w-4 animate-spin" />
							)}
							{createAssetMutation.isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</Form>
		</div>
	);
}
