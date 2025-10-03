import { Button } from "@/components/ui/button";
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
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/integrations/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const createBudgetSchema = z.object({
	income: z.number().min(0.01, "Income is required"),
	categories: z
		.array(
			z.object({
				name: z.string().min(1, "Name is required"),
				percentage: z
					.number()
					.min(0.01, "Percentage is required")
					.max(100, "Percentage must be less than 100"),
			}),
		)
		.min(1, "At least one step is required")
		.refine(
			(data) => {
				return data.reduce((sum, step) => sum + step.percentage, 0) === 100;
			},
			{
				message: "Total percentage must be equal to 100%",
			},
		),
});

type CreateBudgetFormType = z.infer<typeof createBudgetSchema>;

export default function CreateBudget() {
	const [open, setOpen] = useState(false);

	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const createBudgetMutation = useMutation({
		...trpc.budget.createBudget.mutationOptions(),
		onSuccess: () => {
			toast.success("Budget created successfully");
			form.reset();
			queryClient.invalidateQueries({
				queryKey: trpc.budget.getUserBudget.queryKey(),
			});
			setOpen(false);
		},
		onError: () => {
			toast.error("Failed to create budget");
		},
	});

	const form = useForm<CreateBudgetFormType>({
		resolver: zodResolver(createBudgetSchema),
		defaultValues: {
			income: 0,
			categories: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: "categories",
	});

	function onSubmit(values: CreateBudgetFormType) {
		createBudgetMutation.mutate(values);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Plus className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Budget</DialogTitle>
					<DialogDescription>
						Create a new budget to track your finances. You can create different
						Budget categories like Investment, Savings, etc. and give different
						percentages to each category.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="income"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Income</FormLabel>
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
						{form.watch("income") > 0 && (
							<div className="flex flex-col gap-2">
								{fields.map((field, index) => (
									<div
										key={field.id}
										className="grid grid-cols-[1fr_40px] gap-2 items-center"
									>
										<div className="flex gap-2">
											<FormField
												control={form.control}
												name={`categories.${index}.name`}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input
																placeholder="e.g., Investments"
																{...field}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<FormField
												control={form.control}
												name={`categories.${index}.percentage`}
												render={({ field }) => (
													<FormItem>
														<FormControl>
															<Input
																type="number"
																step="0.01"
																min="0"
																max={"100"}
																placeholder="%"
																pattern="^\d*\.?\d{0,2}$"
																className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-16"
																{...field}
																onChange={(e) => {
																	if (Number.parseFloat(e.target.value) > 100)
																		return;
																	const value = Number.parseFloat(
																		Number.parseFloat(e.target.value).toFixed(
																			2,
																		),
																	);
																	field.onChange(
																		Number.isNaN(value) ? 0 : value,
																	);
																}}
															/>
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
											<div className="flex items-center justify-center">
												<p className="text-sm text-gray-500 text-center">
													{(
														(form.watch("income") *
															form.watch(`categories.${index}.percentage`)) /
														100
													).toFixed(2)}
													€
												</p>
											</div>
										</div>
										<Button
											type="button"
											variant="outline"
											size="icon"
											onClick={() => remove(index)}
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								))}

								<Button
									type="button"
									onClick={() => append({ name: "", percentage: 0 })}
								>
									Add Category
								</Button>
							</div>
						)}
						{form.formState.errors.categories && (
							<p className="text-sm text-red-500">
								{form.formState.errors.categories.root?.message}
							</p>
						)}
						<DialogFooter className="flex gap-2 pt-4">
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button type="submit">
								{createBudgetMutation.isPending && (
									<Loader className="mr-2 h-4 w-4 animate-spin" />
								)}
								{createBudgetMutation.isPending ? "Creating..." : "Create"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
