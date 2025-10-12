import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTRPC } from "@/integrations/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { toast } from "sonner";

export default function SelectRecurringMetric() {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const budgetCategoriesQuery = useQuery({
		...trpc.budget.getUserBudget.queryOptions(),
	});

	const selectRecurringMetricMutation = useMutation({
		...trpc.budget.updateBudgetCategoryRecurringMetric.mutationOptions(),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: trpc.budget.getUserBudget.queryKey(),
			});
			queryClient.invalidateQueries({
				queryKey: trpc.recurring.listRecurringTransactions.queryKey(),
			});
			toast.success("Recurring metric updated");
		},
	});

	if (budgetCategoriesQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const selectedRecurringMetric = budgetCategoriesQuery.data?.categories.find(
		(category) => category.recurringMetric,
	);

	return (
		<div className="flex items-center gap-2">
			<Tooltip>
				<TooltipTrigger asChild>
					<Info className="size-4" />
				</TooltipTrigger>
				<TooltipContent>
					<p>Select a recurring metric to display on the chart</p>
				</TooltipContent>
			</Tooltip>

			<Select
				value={selectedRecurringMetric?.id}
				onValueChange={(value) => {
					selectRecurringMetricMutation.mutate({ categoryId: value });
				}}
			>
				<SelectTrigger>
					<SelectValue placeholder="Recurring metric" />
				</SelectTrigger>
				<SelectContent>
					{budgetCategoriesQuery.data?.categories.map((category) => (
						<SelectItem key={category.id} value={category.id}>
							{category.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
