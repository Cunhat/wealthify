import CategoryBadge from "@/components/category-badge";
import PageContainer from "@/components/page-container";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTRPC } from "@/integrations/trpc/react";
import { formatCurrency } from "@/utils/mixins";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { frequencyOptions } from "../components/utils";
import RecurringActions from "../sections/recurring-actions";

export default function RecurringView() {
	const trpc = useTRPC();

	const recurringTransactionsQuery = useQuery({
		...trpc.recurring.listRecurringTransactions.queryOptions(),
	});

	if (recurringTransactionsQuery.isLoading) {
		return <div>Loading...</div>;
	}

	if (recurringTransactionsQuery.data?.length === 0) {
		return <div>No recurring transactions found</div>;
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

	const fullYearRecurring: { [key: string]: number } = {};

	for (const transaction of recurringTransactionsQuery.data ?? []) {
		const interval =
			frequencyOptions.find((opt) => opt.value === transaction.frequency)
				?.multiplier ?? 0;

		let currentDateIterator = dayjs().startOf("year").startOf("month");
		let firstOcc = dayjs(transaction.firstOccurrence);

		while (currentDateIterator.isBefore(dayjs().endOf("year"))) {
			if (currentDateIterator.isSame(firstOcc, "month")) {
				fullYearRecurring[dayjs(currentDateIterator).format("MMM YYYY")] =
					(fullYearRecurring[dayjs(currentDateIterator).format("MMM YYYY")] ??
						0) + Number(transaction.amount);
				firstOcc = dayjs(firstOcc).add(interval, "month");
			} else {
				fullYearRecurring[dayjs(currentDateIterator).format("MMM YYYY")] =
					(fullYearRecurring[dayjs(currentDateIterator).format("MMM YYYY")] ??
						0) + 0;
			}
			currentDateIterator = currentDateIterator.add(1, "month");
		}
	}

	console.log(fullYearRecurring);

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
							className="grid grid-cols-[2fr_1fr_auto] gap-2"
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
							<div className="text-right">
								{formatCurrency(Number(transaction.amount))}
							</div>
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
								{formatCurrency(
									fullYearRecurring[dayjs().format("MMM YYYY")] ?? 0,
								)}
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
				</div>
			</div>
		</PageContainer>
	);
}
