import NotFound from "@/components/not-found";
import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import AnalysesHeader from "../sections/analyses-header";
import { DailyExpensesChart } from "../sections/daily-expenses-chart";
import InfoCards from "../sections/info-cards";
import MonthlyBudgetCategories from "../sections/monthly-budget-categories";
import { MonthlyCategoriesChart } from "../sections/monthly-categories-chart";

export default function AnalysesView() {
	const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
	const [selectedMonth, setSelectedMonth] = useState<string>(
		dayjs().format("MMMM"),
	);
	const trpc = useTRPC();

	const getTransactionsForPeriodQuery = useQuery(
		trpc.analyses.getTransactionsForPeriod.queryOptions({
			year: selectedYear,
			month: selectedMonth,
		}),
	);

	const getAvailableDatesQuery = useQuery(
		trpc.analyses.getAvailableDates.queryOptions(),
	);

	if (
		getAvailableDatesQuery.isLoading ||
		getTransactionsForPeriodQuery.isLoading
	) {
		return <div>Loading...</div>;
	}

	if (
		!getTransactionsForPeriodQuery.isError &&
		getTransactionsForPeriodQuery.data?.length === 0
	) {
		return (
			<PageContainer title="Analyses">
				<div className="flex h-full flex-col gap-4">
					<AnalysesHeader
						availableDates={getAvailableDatesQuery.data ?? new Date()}
						selectedYear={selectedYear}
						setSelectedYear={setSelectedYear}
						selectedMonth={selectedMonth}
						setSelectedMonth={setSelectedMonth}
					/>
					<NotFound message="No transactions found for the selected period" />
				</div>
			</PageContainer>
		);
	}

	return (
		<PageContainer title="Analyses">
			<div className="flex h-full flex-col gap-4 overflow-hidden">
				<AnalysesHeader
					availableDates={getAvailableDatesQuery.data ?? new Date()}
					selectedYear={selectedYear}
					setSelectedYear={setSelectedYear}
					selectedMonth={selectedMonth}
					setSelectedMonth={setSelectedMonth}
				/>
				<div className="flex h-full flex-col gap-4 overflow-y-auto">
					<InfoCards
						data={getTransactionsForPeriodQuery.data ?? []}
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
					/>
					<DailyExpensesChart
						data={getTransactionsForPeriodQuery.data ?? []}
						selectedMonth={selectedMonth}
						selectedYear={selectedYear}
					/>
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
						<MonthlyCategoriesChart
							data={getTransactionsForPeriodQuery.data ?? []}
						/>
						<MonthlyBudgetCategories
							data={getTransactionsForPeriodQuery.data ?? []}
						/>
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
