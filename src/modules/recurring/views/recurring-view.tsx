import CategoryBadge from "@/components/category-badge";
import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";

import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency } from "@/lib/mixins";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Bar, CartesianGrid, ComposedChart, Line, XAxis } from "recharts";
import SelectRecurringMetric from "../components/select-recurring-metric";
import { frequencyOptions } from "../components/utils";
import RecurringActions from "../sections/recurring-actions";
import RecurringTransactionMenuActions from "../sections/recurring-transaction-menu-actions";

export default function RecurringView() {
	const trpc = useTRPC();

	const recurringTransactionsQuery = useQuery({
		...trpc.recurring.listRecurringTransactions.queryOptions(),
	});

	const budgetQuery = useQuery({
		...trpc.budget.getUserBudget.queryOptions(),
	});

	if (recurringTransactionsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (recurringTransactionsQuery.data?.length === 0) {
		return (
			<PageContainer
				title="Recurring Transactions"
				actionsComponent={<RecurringActions />}
			>
				<NotFound message="No recurring transactions found" />
			</PageContainer>
		);
	}

	const totalAnnualAmount = recurringTransactionsQuery.data?.reduce(
		(acc, transaction) =>
			acc +
			Number(transaction.amount) *
				(frequencyOptions?.find(
					(option) => option.value === transaction.frequency,
				)?.multiplier ?? 0),
		0,
	);

	const fullYearRecurring: { [key: string]: number } = Object.fromEntries(
		["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
			(m) => [m, 0],
		),
	);

	const startOfYear = dayjs().startOf("year");
	const endOfYear = dayjs().endOf("year");

	for (const transaction of recurringTransactionsQuery.data ?? []) {
		const interval =
			frequencyOptions.find((opt) => opt.value === transaction.frequency)
				?.interval ?? 0;

		if (interval === 0) continue;

		let occ = dayjs(transaction.firstOccurrence);

		// Advance to the first occurrence that falls within the current year
		while (occ.isBefore(startOfYear, "month")) {
			occ = occ.add(interval, "month");
		}

		// Count every occurrence within the current year
		while (!occ.isAfter(endOfYear, "month")) {
			const monthKey = occ.format("MMM");
			fullYearRecurring[monthKey] =
				(fullYearRecurring[monthKey] ?? 0) + Number(transaction.amount);
			occ = occ.add(interval, "month");
		}
	}

	const recurringMetric = budgetQuery.data?.categories.find(
		(category) => category.recurringMetric,
	);

	// Format data for the chart
	const chartData = Object.entries(fullYearRecurring).map(
		([month, amount]) => ({
			month: month,
			amount: amount,
			recurringMetric:
				(Number(recurringMetric?.percentage) *
					Number(budgetQuery.data?.income)) /
				100,
		}),
	);

	const chartConfig = {
		amount: {
			label: "Amount",
			color: "var(--chart-1)",
		},
		recurringMetric: {
			label: recurringMetric?.name,
			color: "var(--chart-5)",
		},
	};

	return (
		<PageContainer
			title="Recurring Transactions"
			actionsComponent={<RecurringActions />}
		>
			<div className="grid grid-cols-[1fr_10px_1fr] h-full gap-4 overflow-hidden">
				<div className="flex flex-col gap-4 overflow-y-auto h-full">
					{recurringTransactionsQuery.data?.map((transaction) => (
						<div
							key={transaction.id}
							className="grid grid-cols-[2fr_1fr_auto_auto] gap-2 relative"
						>
							<div className="flex items-center gap-2">
								<p>{transaction.description}</p>
								<p className="text-xs text-muted-foreground">
									{
										frequencyOptions.find(
											(option) => option.value === transaction.frequency,
										)?.label
									}
								</p>
							</div>
							<div className="flex justify-end items-center gap-2">
								<CategoryBadge category={transaction.category} />
							</div>
							<div className="text-right flex items-center gap-2">
								{formatCurrency(Number(transaction.amount))}

								<span className="text-xs text-muted-foreground/50">|</span>
								{formatCurrency(
									Number(transaction.amount) *
										(frequencyOptions.find(
											(option) => option.value === transaction.frequency,
										)?.multiplier ?? 0),
								)}
							</div>
							<RecurringTransactionMenuActions transaction={transaction} />
						</div>
					))}
				</div>
				<Separator orientation="vertical" />
				<div className="flex flex-col gap-4 h-full overflow-y-auto @container/main">
					<Card className="flex @md/main:flex-row justify-between p-6">
						<div>
							<p className="text-base font-semibold">{`${dayjs().format("MMMM")} Total Amount`}</p>
							<p className="text-sm text-muted-foreground">
								{`Total of all your recurring expenses for ${dayjs().format("MMMM")}`}
							</p>
						</div>
						<div className="flex items-center justify-end">
							<p className="text-xl @md/main:text-lg font-semibold">
								{formatCurrency(fullYearRecurring[dayjs().format("MMM")] ?? 0)}
							</p>
						</div>
					</Card>
					<Card className="flex @md/main:flex-row justify-between p-6">
						<div>
							<p className="text-base font-semibold">Total Annual Amount</p>
							<p className="text-sm text-muted-foreground">
								Total of all your recurring expenses for the year
							</p>
						</div>
						<div className="flex items-center justify-end">
							<p className="text-xl @md/main:text-lg font-semibold">
								{formatCurrency(totalAnnualAmount ?? 0)}
							</p>
						</div>
					</Card>
					<Card className="p-6">
						<CardHeader className="p-0 pb-4 flex items-center justify-between">
							<div className="flex flex-col gap-1">
								<CardTitle>Monthly Breakdown</CardTitle>
								<CardDescription>
									Recurring transactions by month for {dayjs().format("YYYY")}
								</CardDescription>
							</div>
							<SelectRecurringMetric />
						</CardHeader>
						<CardContent className="p-0">
							<ChartContainer config={chartConfig} className="h-[300px] w-full">
								<ComposedChart data={chartData}>
									<XAxis
										dataKey="month"
										tick={{ fontSize: 12 }}
										tickLine={false}
										axisLine={false}
									/>
									<CartesianGrid vertical={false} />

									<ChartTooltip
										cursor={false}
										content={<ChartTooltipContent indicator="line" />}
									/>
									<Line
										dataKey="recurringMetric"
										strokeWidth={2}
										stroke="var(--color-recurringMetric)"
									/>
									<Bar
										dataKey="amount"
										fill="var(--color-amount)"
										radius={[4, 4, 0, 0]}
									/>
								</ComposedChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>
			</div>
		</PageContainer>
	);
}
