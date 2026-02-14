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

	const grouped = frequencyOptions
		.map((opt) => ({
			...opt,
			transactions: (recurringTransactionsQuery.data ?? []).filter(
				(t) => t.frequency === opt.value,
			),
		}))
		.filter((g) => g.transactions.length > 0);

	const totalAnnualAmount = recurringTransactionsQuery.data?.reduce(
		(acc, t) =>
			acc +
			Number(t.amount) *
				(frequencyOptions.find((o) => o.value === t.frequency)?.multiplier ??
					0),
		0,
	);

	const fullYearRecurring: { [key: string]: number } = Object.fromEntries(
		[
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		].map((m) => [m, 0]),
	);

	const startOfYear = dayjs().startOf("year");
	const endOfYear = dayjs().endOf("year");

	for (const transaction of recurringTransactionsQuery.data ?? []) {
		const interval =
			frequencyOptions.find((opt) => opt.value === transaction.frequency)
				?.interval ?? 0;

		if (interval === 0) continue;

		let occ = dayjs(transaction.firstOccurrence);

		while (occ.isBefore(startOfYear, "month")) {
			occ = occ.add(interval, "month");
		}

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

	const chartData = Object.entries(fullYearRecurring).map(
		([month, amount]) => ({
			month,
			amount,
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
				{/* Left: grouped transaction list */}
				<div className="flex flex-col gap-5 overflow-y-auto h-full">
					{grouped.map((group) => (
						<div key={group.value} className="flex flex-col gap-1">
							{/* Group header */}
							<div className="py-1 border-b border-border/50">
								<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
									{group.label}
								</span>
							</div>
							<div className="flex flex-col gap-1 px-4">
								{/* Transactions in this group */}
								{group.transactions.map((transaction) => {
									const annualAmount =
										Number(transaction.amount) * group.multiplier;
									const monthlyEquiv =
										Number(transaction.amount) / group.interval;

									return (
										<div
											key={transaction.id}
											className="grid grid-cols-[auto_auto_20px] gap-3 items-center py-2"
										>
											<div className="flex gap-4">
												<p className="text-sm truncate">
													{transaction.description}
												</p>
												<CategoryBadge category={transaction.category} />
											</div>
											<div className="flex flex-col items-end min-w-[90px]">
												<span className="text-sm font-medium">
													{formatCurrency(Number(transaction.amount))}
												</span>
												<span className="text-xs text-muted-foreground">
													{formatCurrency(monthlyEquiv)} / mo ·{" "}
													{formatCurrency(annualAmount)} / yr
												</span>
											</div>
											<RecurringTransactionMenuActions
												transaction={transaction}
											/>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>

				<Separator orientation="vertical" />

				{/* Right: summary + chart */}
				<div className="flex flex-col gap-4 h-full overflow-y-auto @container/main">
					<Card className="p-6">
						<div className="grid grid-cols-2 divide-x divide-border">
							<div className="flex flex-col gap-1 pr-6">
								<p className="text-xs text-muted-foreground uppercase tracking-wide">
									{dayjs().format("MMMM")}
								</p>
								<p className="text-2xl font-semibold">
									{formatCurrency(
										fullYearRecurring[dayjs().format("MMM")] ?? 0,
									)}
								</p>
								<p className="text-xs text-muted-foreground">
									Total recurring this month
								</p>
							</div>
							<div className="flex flex-col gap-1 pl-6">
								<p className="text-xs text-muted-foreground uppercase tracking-wide">
									{dayjs().format("YYYY")}
								</p>
								<p className="text-2xl font-semibold">
									{formatCurrency(totalAnnualAmount ?? 0)}
								</p>
								<p className="text-xs text-muted-foreground">
									Total recurring this year
								</p>
							</div>
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
