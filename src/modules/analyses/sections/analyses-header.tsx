import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import dayjs from "dayjs";

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

type AnalysesHeaderProps = {
	selectedYear: number;
	setSelectedYear: (year: number) => void;
	selectedMonth: string;
	setSelectedMonth: (month: string) => void;
	availableDates: Date;
};

export default function AnalysesHeader({
	selectedYear,
	setSelectedYear,
	selectedMonth,
	setSelectedMonth,
	availableDates,
}: AnalysesHeaderProps) {
	return (
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
						.filter((year) => Number(year) >= dayjs(availableDates).year())
						.map((year) => (
							<SelectItem key={year} value={year}>
								{year}
							</SelectItem>
						))}
				</SelectContent>
			</Select>
		</div>
	);
}
