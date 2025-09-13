import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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

const chartConfig = {
	netWorth: {
		label: "Net Worth",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export default function NetWorthWidget() {
	const trpc = useTRPC();

	const historyQuery = useQuery(trpc.history.getUserHistory.queryOptions());

	if (historyQuery.isLoading) {
		return <div>Loading...</div>;
	}

	const chartData = [];
	let dateIterator = dayjs().subtract(1, "year");

	while (dayjs(dateIterator).isBefore(dayjs())) {
		const currDateYear = dayjs(dateIterator).year();
		const currDateMonth = dayjs(dateIterator).format("MMMM").toLowerCase();

		console.log(currDateYear, currDateMonth);

		const netWorthForDate = historyQuery.data
			?.filter((elem) => elem.year === currDateYear)
			.reduce(
				(acc, elem) =>
					acc + Number(elem[currDateMonth as keyof typeof elem] ?? 0),
				0,
			);

		chartData.push({
			date: dateIterator.format("MMM YYYY"),
			value: netWorthForDate,
		});

		dateIterator = dayjs(dateIterator).add(1, "month");
	}

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
					className="aspect-auto h-[250px] w-full"
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
