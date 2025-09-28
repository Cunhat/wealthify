import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { IncomeVsExpensesChart } from "../components/income-vs-expenses-chart";

export default function IncomeVsExpensesWidget() {
	const trpc = useTRPC();

	const incomeVsExpensesQuery = useQuery({
		...trpc.metrics.getIncomeVsExpenses.queryOptions(),
	});

	if (incomeVsExpensesQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Net Worth Evolution</CardTitle>
					<CardDescription>
						Monthly percentage change in net worth over the last year
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center items-center h-[200px]">
					<Loader className="w-4 h-4 animate-spin" />
				</CardContent>
			</Card>
		);
	}

	return <IncomeVsExpensesChart data={incomeVsExpensesQuery.data ?? []} />;
}
