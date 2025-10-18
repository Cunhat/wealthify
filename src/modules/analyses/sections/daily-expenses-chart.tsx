"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { Transaction } from "@/lib/schemas";
import dayjs from "dayjs";

const chartConfig = {
	income: {
		label: "Income",
		color: "var(--chart-2)",
	},
	expenses: {
		label: "Expenses",
		color: "var(--chart-5)",
	},
} satisfies ChartConfig;

type DailyExpensesChartProps = {
	data: Transaction[];
	selectedMonth: string;
	selectedYear: number;
};

export function DailyExpensesChart({
	data,
	selectedMonth,
	selectedYear,
}: DailyExpensesChartProps) {
	const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);

	// Get the number of days in the selected month
	const daysInMonth = selectedDate.daysInMonth();

	// Create array of daily data
	const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
		const day = i + 1;
		const currentDate = selectedDate.date(day);

		// Filter transactions for this specific day
		const dayTransactions = data.filter((transaction) => {
			const transactionDate = dayjs(transaction.createdAt);
			return transactionDate.isSame(currentDate, "day");
		});

		// Calculate income and expenses
		const income = dayTransactions
			.filter((t) => t.type === "income")
			.reduce((sum, t) => sum + Number(t.amount), 0);

		const expenses = dayTransactions
			.filter((t) => t.type === "expense")
			.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

		return {
			day: currentDate.format("DD"),
			income,
			expenses,
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily Income vs Expenses</CardTitle>
				<CardDescription>
					Showing your income and expenses for {selectedMonth} {selectedYear}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig} className="h-[200px] w-full">
					<BarChart accessibilityLayer data={dailyData}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="day"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
						/>
						<ChartTooltip content={<ChartTooltipContent hideLabel />} />
						<ChartLegend content={<ChartLegendContent />} />
						<Bar
							dataKey="income"
							stackId="a"
							fill="var(--color-income)"
							radius={[0, 0, 4, 4]}
						/>
						<Bar
							dataKey="expenses"
							stackId="a"
							fill="var(--color-expenses)"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
