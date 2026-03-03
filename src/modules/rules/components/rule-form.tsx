import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { type AccountType, AccountTypeGroups } from "@/lib/configs/accounts";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	descriptionContains: z.string().min(1, "Description pattern is required"),
	categoryId: z.string().nullable().optional(),
	budgetCategoryId: z.string().nullable().optional(),
	transactionAccountId: z.string().nullable().optional(),
	type: z.enum(["expense", "income"]).nullable().optional(),
});

export type RuleFormValues = z.infer<typeof formSchema>;

interface RuleFormProps {
	defaultValues?: Partial<RuleFormValues>;
	onSubmit: (values: RuleFormValues) => void;
	isPending: boolean;
	setOpen: (open: boolean) => void;
}

export default function RuleForm({
	defaultValues,
	onSubmit,
	isPending,
	setOpen,
}: RuleFormProps) {
	const trpc = useTRPC();

	const categoriesQuery = useQuery(
		trpc.categories.listCategories.queryOptions(),
	);
	const budgetCategoriesQuery = useQuery(
		trpc.budget.getBudgetCategories.queryOptions(),
	);
	const accountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);

	const form = useForm<RuleFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			descriptionContains: "",
			categoryId: null,
			budgetCategoryId: null,
			transactionAccountId: null,
			type: null,
			...defaultValues,
		},
	});

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-4"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Rule Name</FormLabel>
							<FormControl>
								<Input placeholder="e.g. Netflix subscription" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="descriptionContains"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description Pattern</FormLabel>
							<FormControl>
								<Input placeholder="e.g. netflix" {...field} />
							</FormControl>
							<FormDescription>
								Case-insensitive — matches if the transaction description
								contains this text
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="categoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Category</FormLabel>
							<Select
								onValueChange={(v) =>
									field.onChange(v === "_none" ? null : v)
								}
								value={field.value ?? "_none"}
							>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="None" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="_none">None</SelectItem>
									{categoriesQuery.data?.map((cat) => (
										<SelectItem key={cat.id} value={cat.id}>
											{cat.name}
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
					name="budgetCategoryId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Budget Category</FormLabel>
							<Select
								onValueChange={(v) =>
									field.onChange(v === "_none" ? null : v)
								}
								value={field.value ?? "_none"}
							>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="None" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="_none">None</SelectItem>
									{budgetCategoriesQuery.data?.map((bc) => (
										<SelectItem key={bc.id} value={bc.id}>
											{bc.name}
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
					name="transactionAccountId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Account</FormLabel>
							<Select
								onValueChange={(v) =>
									field.onChange(v === "_none" ? null : v)
								}
								value={field.value ?? "_none"}
							>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="None" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="_none">None</SelectItem>
									{AccountTypeGroups.map((group) => {
										const types = group.children.map((c) => c.type);
										const accounts = accountsQuery.data?.filter((a) =>
											types.includes(a.type as AccountType),
										);
										if (!accounts?.length) return null;
										return (
											<SelectGroup key={group.name}>
												<SelectLabel>{group.name}</SelectLabel>
												{accounts.map((a) => (
													<SelectItem key={a.id} value={a.id}>
														{a.name}
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
					name="type"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Transaction Type</FormLabel>
							<Select
								onValueChange={(v) =>
									field.onChange(v === "_none" ? null : v)
								}
								value={field.value ?? "_none"}
							>
								<FormControl>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Any" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="_none">Any</SelectItem>
									<SelectItem value="expense">Expense</SelectItem>
									<SelectItem value="income">Income</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={isPending}>
						{isPending ? "Saving..." : "Save Rule"}
					</Button>
				</DialogFooter>
			</form>
		</Form>
	);
}
