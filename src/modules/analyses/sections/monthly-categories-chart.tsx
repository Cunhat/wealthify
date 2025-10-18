"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";

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
import type { Category, Transaction } from "@/lib/schemas";

export const description = "A mixed bar chart";

type MonthlyCategoriesChartProps = {
	data: Transaction[];
};

export function MonthlyCategoriesChart({ data }: MonthlyCategoriesChartProps) {
	// Calculate amount spent in each category
	const categorySpending = data.reduce(
		(acc, transaction) => {
			// Only process transactions that have a category
			if (transaction.category) {
				const categoryId = transaction.category.id;

				const amount = Number(transaction.amount);

				if (!acc[categoryId]) {
					acc[categoryId] = {
						...transaction.category,
						total: 0,
					};
				}

				acc[categoryId].total += amount;
			}

			return acc;
		},
		{} as Record<string, Category & { total: number }>,
	);

	// Convert to array and sort by total spending (descending)
	const categoryData = Object.values(categorySpending).sort(
		(a, b) => b.total - a.total,
	);

	const chartData = categoryData.map((category) => ({
		category: category.name,
		total: category.total,
		fill: category.color,
		icon: category.icon,
	}));

	// Store icons separately for use in the formatter
	const categoryIcons = Object.fromEntries(
		categoryData.map((category) => [category.name, category.icon]),
	);

	const chartConfig = Object.fromEntries(
		categoryData.map((category) => [
			category.name,
			{
				label: category.name,
				color: category.color,
			},
		]),
	) satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Bar Chart - Mixed</CardTitle>
				<CardDescription>January - June 2024</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={chartData} layout="vertical">
						<YAxis
							dataKey="category"
							type="category"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							width={150}
							tickFormatter={(value) => {
								const icon = categoryIcons[value as string];
								const config = chartConfig[value as keyof typeof chartConfig];
								return icon && config ? `${icon} ${config.label}` : value;
							}}
						/>
						<XAxis dataKey="total" type="number" hide />
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Bar dataKey="total" layout="vertical" radius={5} />
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
