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
import {
	calculateAccountNetWorth,
	harmonizeBalanceAccountHistory,
} from "@/utils/balance-harmonization";
import dayjs from "dayjs";

const chartConfig = {
	netWorth: {
		label: "Net Worth",
		color: "var(--chart-1)",
	},
} satisfies ChartConfig;

export default function NetWorthWidget() {
	const trpc = useTRPC();

	// const netWorthQuery = useQuery(trpc.metrics.getNetWorth.queryOptions());

	const balanceAccountsQuery = useQuery(
		trpc.accounts.listBalanceAccounts.queryOptions(),
	);
	const transactionAccountsQuery = useQuery(
		trpc.accounts.listTransactionAccounts.queryOptions(),
	);

	const netWorthData: {
		[key: string]: number;
	} = {};

	if (balanceAccountsQuery.isLoading || transactionAccountsQuery.isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Net Worth</CardTitle>
					<CardDescription>
						Showing your net worth for the last 12 months
					</CardDescription>
				</CardHeader>
				<CardContent className="flex justify-center items-center h-[200px]">
					<p>Loading...</p>
				</CardContent>
			</Card>
		);
	}

	let dateIterator = dayjs().subtract(1, "year").startOf("month").toDate();
	// Harmonize balance account history to fill gaps
	const harmonizedBalanceHistory = harmonizeBalanceAccountHistory(
		balanceAccountsQuery.data ?? [],
	);

	while (dayjs(dateIterator).isBefore(dayjs())) {
		const currDateYear = dayjs(dateIterator).year();
		const currDateMonth = dayjs(dateIterator).format("MMMM").toLowerCase();

		const netWorthForDate = harmonizedBalanceHistory.filter(
			(elem) => elem.year === currDateYear,
		);

		const key = dayjs(dateIterator).format("MMM YYYY");

		const totalNetWorthForDate = netWorthForDate?.reduce(
			(acc, elem) => acc + Number(elem[currDateMonth as keyof typeof elem]),
			0,
		);

		netWorthData[key] = (netWorthData[key] ?? 0) + totalNetWorthForDate;

		dateIterator = dayjs(dateIterator).add(1, "month").toDate();
	}

	// Calculate net worth for transaction accounts

	dateIterator = dayjs().subtract(1, "year").startOf("month").toDate();

	for (const account of transactionAccountsQuery.data ?? []) {
		const netWorthDataForTransAcc = calculateAccountNetWorth(account);

		for (const key in netWorthDataForTransAcc) {
			netWorthData[key] = netWorthData[key] + netWorthDataForTransAcc[key];
		}
	}

	// const chartData = netWorthQuery.data ?? [];
	const chartData = Object.entries(netWorthData).map(([key, value]) => ({
		date: key,
		value,
	}));

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
