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

type AnalysesHeaderProps = {
	selectedYear: number | undefined;
	setSelectedYear: (year: number) => void;
	selectedMonth: string | undefined;
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
	const years = [
		dayjs().year().toString(),
		dayjs().subtract(1, "year").year().toString(),
	];

	console.log(availableDates);

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
						months
							.filter((month) => {
								const dateBuilder = `${selectedYear}-${months.indexOf(month) + 1}-01`;
								return (
									(!dayjs(dateBuilder).isAfter(dayjs()) &&
										!dayjs(dateBuilder).isBefore(dayjs(availableDates))) ||
									dayjs(dateBuilder).isSame(dayjs(availableDates), "month")
								);
							})
							.map((month) => (
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
