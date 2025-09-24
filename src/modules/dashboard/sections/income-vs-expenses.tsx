import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { IncomeVsExpensesChart } from "../components/income-vs-expenses-chart";

export default function IncomeVsExpensesWidget() {
	const trpc = useTRPC();

	const incomeVsExpensesQuery = useQuery({
		...trpc.metrics.getIncomeVsExpenses.queryOptions(),
	});

	console.log(incomeVsExpensesQuery.data);

	return <IncomeVsExpensesChart data={incomeVsExpensesQuery.data ?? []} />;
}
