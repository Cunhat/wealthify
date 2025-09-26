import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { IncomeVsExpensesChart } from "../components/income-vs-expenses-chart";

export default function IncomeVsExpensesWidget() {
	const trpc = useTRPC();

	const incomeVsExpensesQuery = useQuery({
		...trpc.metrics.getIncomeVsExpenses.queryOptions(),
	});

	if (incomeVsExpensesQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return <IncomeVsExpensesChart data={incomeVsExpensesQuery.data ?? []} />;
}
