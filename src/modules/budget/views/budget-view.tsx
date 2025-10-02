import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import BudgetActions from "../sections/budget-actions";

export default function BudgetView() {
	const trpc = useTRPC();
	const budgetQuery = useQuery({ ...trpc.budget.getUserBudget.queryOptions() });

	if (budgetQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (budgetQuery.isError) {
		return <div>Error: {budgetQuery.error.message}</div>;
	}

	return (
		<PageContainer
			title="Budget"
			actionsComponent={<BudgetActions budget={budgetQuery.data} />}
		>
			<div>BudgetView</div>
		</PageContainer>
	);
}
