import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import type { Budget } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import BudgetActions from "../sections/budget-actions";

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
			<div className="gird h-full grid-cols-[1fr_10px_1fr] overflow-hidden gap-4">
				<div className="h-full flex flex-col gap-4 overflow-y-auto"></div>
			</div>
		</PageContainer>
	);
}
