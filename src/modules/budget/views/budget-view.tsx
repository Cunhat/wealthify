import PageContainer from "@/components/page-container";
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
			<div className="h-full flex flex-col gap-4 @container/main items-center">
				<BudgetMainInfo budget={budgetQuery.data as Budget} />
			</div>
		</PageContainer>
	);
}
