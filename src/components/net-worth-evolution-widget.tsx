import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

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
import type {
	NameType,
	ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import type {
	ContentType,
	TooltipProps,
} from "recharts/types/component/Tooltip";

const chartConfig = {
	evolution: {
		label: "Evolution %",
		color: "var(--chart-2)",
	},
	positive: {
		label: "Positive",
		color: "hsl(var(--chart-2))",
	},
	negative: {
		label: "Negative",
		color: "hsl(var(--destructive))",
	},
} satisfies ChartConfig;

interface EvolutionData {
	date: string;
	evolution: number;
	fill: string;
}

export default function NetWorthEvolutionWidget() {
	const trpc = useTRPC();

	const netWorthQuery = useQuery(trpc.metrics.getNetWorth.queryOptions());

	if (netWorthQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const rawData = netWorthQuery.data ?? [];

	// Calculate month-to-month percentage evolution
	const chartData: EvolutionData[] = rawData.reduce(
		(acc: EvolutionData[], current, index) => {
			if (index === 0) {
				// Skip the first month as we can't calculate evolution
				return acc;
			}

			const previousValue = rawData[index - 1].value;
			const currentValue = current.value;

			// Handle division by zero or when previous value is 0
			let evolutionPercentage = 0;
			if (previousValue !== 0) {
				evolutionPercentage =
					((currentValue - previousValue) / Math.abs(previousValue)) * 100;
			} else if (currentValue > 0) {
				evolutionPercentage = 100; // If we go from 0 to positive, show 100%
			} else if (currentValue < 0) {
				evolutionPercentage = -100; // If we go from 0 to negative, show -100%
			}

			acc.push({
				date: current.date,
				evolution: evolutionPercentage,
				fill:
					evolutionPercentage >= 0
						? chartConfig.positive.color
						: chartConfig.negative.color,
			});

			return acc;
		},
		[],
	);

	// Custom tooltip formatter to show percentage with proper formatting
	const CustomTooltipContent = ({
		active,
		payload,
		label,
	}: TooltipProps<ValueType, NameType>) => {
		if (active && payload && payload.length) {
			const value = payload[0].value as number;
			const isPositive = value >= 0;
			return (
				<div className="rounded-lg border bg-background p-2 shadow-sm">
					<div className="flex flex-col gap-1">
						<span className="text-[0.70rem] text-foreground font-medium">
							{label}
						</span>
						<span
							className={`font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
						>
							{isPositive ? "+" : ""}
							{value.toFixed(2)}%
						</span>
					</div>
				</div>
			);
		}
		return null;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Net Worth Evolution</CardTitle>
				<CardDescription>
					Monthly percentage change in net worth over the last year
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[200px] w-full"
				>
					<BarChart
						accessibilityLayer
						data={chartData}
						margin={{
							left: 12,
							right: 12,
						}}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => value.slice(0, 3)}
						/>
						<YAxis
							tickLine={false}
							axisLine={false}
							tickMargin={8}
							tickFormatter={(value) => `${value}%`}
						/>
						<ChartTooltip cursor={false} content={CustomTooltipContent} />
						<Bar dataKey="evolution" radius={4}>
							{chartData.map((entry) => (
								<Cell
									key={`cell-${entry.date}`}
									fill={
										entry.evolution > 0 ? "var(--chart-2)" : "var(--chart-5)"
									}
								/>
							))}
						</Bar>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
