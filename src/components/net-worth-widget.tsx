import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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

const chartConfig = {
	netWorth: {
		label: "Net Worth",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export default function NetWorthWidget() {
	const trpc = useTRPC();

	const netWorthQuery = useQuery(trpc.metrics.getNetWorth.queryOptions());

	if (netWorthQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const chartData = netWorthQuery.data ?? [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Net Worth</CardTitle>
				<CardDescription>
					Showing your net worth for the last 12 months
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ChartContainer
					config={chartConfig}
					className="aspect-auto h-[200px] w-full"
				>
					<AreaChart
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
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent indicator="line" />}
						/>

						<Area
							dataKey="value"
							type="natural"
							fill="var(--color-netWorth)"
							fillOpacity={0.4}
							stroke="var(--color-netWorth)"
							stackId="a"
						/>
					</AreaChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
