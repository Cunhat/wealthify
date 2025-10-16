import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Loader } from "lucide-react";
import { useMemo } from "react";
import { IncomeVsExpensesChart } from "../components/income-vs-expenses-chart";

export default function IncomeVsExpensesWidget() {
	const trpc = useTRPC();

	const incomeVsExpensesQuery = useQuery({
		...trpc.metrics.getIncomeVsExpenses.queryOptions(),
	});

	const chartData = useMemo(() => {
		if (!incomeVsExpensesQuery.data) return [];

		let currDateIterator = dayjs().subtract(6, "months").startOf("month");
		const lastYearMonthlyIncome = [];

		while (dayjs(currDateIterator).isBefore(dayjs())) {
			const currMonth = dayjs(currDateIterator).format("MMM");

			const monthlyIncome = incomeVsExpensesQuery.data.filter(
				(transaction) =>
					dayjs(transaction.createdAt).isSame(currDateIterator, "month") &&
					dayjs(transaction.createdAt).isSame(currDateIterator, "year") &&
					transaction.type === "income",
			);
			const monthlyExpenses = incomeVsExpensesQuery.data.filter(
				(transaction) =>
					dayjs(transaction.createdAt).isSame(currDateIterator, "month") &&
					dayjs(transaction.createdAt).isSame(currDateIterator, "year") &&
					transaction.type === "expense",
			);

			lastYearMonthlyIncome.push({
				date: currMonth,
				income: monthlyIncome.reduce(
					(acc, transaction) => acc + Number(transaction.amount),
					0,
				),
				expenses: monthlyExpenses.reduce(
					(acc, transaction) => acc + Number(transaction.amount),
					0,
				),
			});

			currDateIterator = dayjs(currDateIterator).add(1, "month");
		}

		return lastYearMonthlyIncome;
	}, [incomeVsExpensesQuery.data]);

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

	return <IncomeVsExpensesChart data={chartData} />;
}
