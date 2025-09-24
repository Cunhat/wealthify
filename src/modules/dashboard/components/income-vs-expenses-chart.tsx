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
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple bar chart";

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

type IncomeVsExpensesChartProps = {
	data: {
		date: string;
		income: number;
		expenses: number;
	}[];
};

export function IncomeVsExpensesChart({ data }: IncomeVsExpensesChartProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Income vs Expenses</CardTitle>
				<CardDescription>
					Showing your income and expenses for the last 12 months
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[200px] w-full"
				>
					<BarChart accessibilityLayer data={data}>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							// tickFormatter={(value) => value}
						/>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="dashed" />}
						/>
						<Bar dataKey="income" fill="var(--color-income)" radius={4} />
						<Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
