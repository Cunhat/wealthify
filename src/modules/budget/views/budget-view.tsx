import PageContainer from "@/components/page-container";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/integrations/trpc/react";
import type { Budget } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import BudgetActions from "../sections/budget-actions";
import BudgetMainInfo from "../sections/budget-main-info";

export default function BudgetView() {
	const trpc = useTRPC();
	const budgetQuery = useQuery({ ...trpc.budget.getUserBudget.queryOptions() });

	console.log(budgetQuery.data);

	if (budgetQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (budgetQuery.isError) {
		return <div>Error: {budgetQuery.error.message}</div>;
	}

	return (
		<PageContainer
			title="Budget"
			actionsComponent={<BudgetActions budget={budgetQuery.data as Budget} />}
		>
			<div className="grid h-full grid-cols-[1fr_10px_1fr] overflow-hidden gap-4">
				<BudgetMainInfo budget={budgetQuery.data as Budget} />
				<Separator orientation="vertical" />
			</div>
		</PageContainer>
	);
}
