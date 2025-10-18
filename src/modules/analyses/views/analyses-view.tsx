import PageContainer from "@/components/page-container";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import AnalysesHeader from "../sections/analyses-header";
import { DailyExpensesChart } from "../sections/daily-expenses-chart";
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

	return (
		<PageContainer title="Analyses">
			<div className="flex flex-col gap-4">
				<AnalysesHeader
					availableDates={getAvailableDatesQuery.data ?? new Date()}
					selectedYear={selectedYear}
					setSelectedYear={setSelectedYear}
					selectedMonth={selectedMonth}
					setSelectedMonth={setSelectedMonth}
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
				</div>
			</div>
		</PageContainer>
	);
}
