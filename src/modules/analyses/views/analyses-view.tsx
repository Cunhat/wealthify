import PageContainer from "@/components/page-container";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/integrations/trpc/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";

const months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const years = [
	dayjs().year().toString(),
	dayjs().subtract(1, "year").year().toString(),
];

export default function AnalysesView() {
	const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
	const [selectedMonth, setSelectedMonth] = useState<string>(
		dayjs().format("MMMM"),
	);

	const trpc = useTRPC();

	const getAvailableDatesQuery = useQuery(
		trpc.analyses.getAvailableDates.queryOptions(),
	);

	if (getAvailableDatesQuery.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<PageContainer title="Analyses">
			<div className="flex justify-end gap-4">
				<Select
					onValueChange={(value) => setSelectedMonth(value)}
					value={selectedMonth}
					disabled={!selectedYear}
				>
					<SelectTrigger className="w-[150px]">
						<SelectValue placeholder="Select a month" />
					</SelectTrigger>
					<SelectContent>
						{selectedYear &&
							months.map((month) => (
								<SelectItem key={month} value={month}>
									{month}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
				<Select
					value={selectedYear?.toString()}
					onValueChange={(value) => setSelectedYear(Number(value))}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a year" />
					</SelectTrigger>
					<SelectContent>
						{years
							.filter(
								(year) =>
									Number(year) >= dayjs(getAvailableDatesQuery.data).year(),
							)
							.map((year) => (
								<SelectItem key={year} value={year}>
									{year}
								</SelectItem>
							))}
					</SelectContent>
				</Select>
			</div>
		</PageContainer>
	);
}
