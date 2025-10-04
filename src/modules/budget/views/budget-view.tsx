import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import BudgetActions from "../sections/budget-actions";
import BudgetMainInfo from "../sections/budget-main-info";

export default function BudgetView() {
	const trpc = useTRPC();
	const budgetQuery = useQuery({ ...trpc.budget.getUserBudget.queryOptions() });

	if (budgetQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (budgetQuery.isError) {
		return <div>Error: {budgetQuery.error.message}</div>;
	}

	if (!budgetQuery.data) {
		return (
			<PageContainer
				title="Budget"
				actionsComponent={<BudgetActions budget={null} />}
			>
				<NotFound message="No budget found..." />
			</PageContainer>
		);
	}

	return (
		<PageContainer
			title="Budget"
			actionsComponent={<BudgetActions budget={budgetQuery.data} />}
		>
			<div className="h-full flex flex-col gap-4 @container/main items-center">
				<BudgetMainInfo budget={budgetQuery.data} />
			</div>
		</PageContainer>
	);
}
