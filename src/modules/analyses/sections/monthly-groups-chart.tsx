"use client";

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
import { useTRPC } from "@/integrations/trpc/react";
import type { Transaction } from "@/lib/schemas";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

type MonthlyGroupsChartProps = {
	data: Transaction[];
};

export function MonthlyGroupsChart({ data }: MonthlyGroupsChartProps) {
	const trpc = useTRPC();

	const groupsQuery = useQuery({
		...trpc.categoryGroups.listCategoryGroups.queryOptions(),
	});

	const groups = groupsQuery.data ?? [];

	// Accumulate spending per groupId
	const groupSpending = data
		.filter((t) => t.type === "expense" && !t.excluded && t.category?.groupId)
		.reduce(
			(acc, t) => {
				const groupId = t.category!.groupId!;
				acc[groupId] = (acc[groupId] ?? 0) + Number(t.amount);
				return acc;
			},
			{} as Record<string, number>,
		);

	const chartData = groups
		.filter((g) => groupSpending[g.id] !== undefined)
		.map((g) => ({
			group: g.name,
			total: groupSpending[g.id],
			fill: g.color,
			icon: g.icon,
		}))
		.sort((a, b) => b.total - a.total);

	const groupIcons = Object.fromEntries(
		chartData.map((g) => [g.group, g.icon]),
	);

	const chartConfig = Object.fromEntries(
		chartData.map((g) => [
			g.group,
			{
				label: g.group,
				color: g.fill,
			},
		]),
	) satisfies ChartConfig;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Groups</CardTitle>
				<CardDescription>
					Showing your expenses by category group for the selected period
				</CardDescription>
			</CardHeader>
			<CardContent>
				{chartData.length === 0 ? (
					<p className="text-sm text-muted-foreground py-4 text-center">
						No group expenses for this period
					</p>
				) : (
					<ChartContainer config={chartConfig}>
						<BarChart accessibilityLayer data={chartData} layout="vertical">
							<YAxis
								dataKey="group"
								type="category"
								tickLine={false}
								tickMargin={10}
								axisLine={false}
								tickFormatter={(value) => {
									const icon = groupIcons[value as string];
									const config = chartConfig[value as keyof typeof chartConfig];
									return icon && config ? `${icon} ${config.label}` : value;
								}}
							/>
							<XAxis dataKey="total" type="number" hide />
							<ChartTooltip
								cursor={false}
								content={<ChartTooltipContent hideLabel />}
							/>
							<Bar dataKey="total" layout="vertical" radius={5} barSize={32} />
						</BarChart>
					</ChartContainer>
				)}
			</CardContent>
		</Card>
	);
}
