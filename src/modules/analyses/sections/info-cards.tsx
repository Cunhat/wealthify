import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/mixins";
import type { Transaction } from "@/lib/schemas";
import { IconTrendingUp } from "@tabler/icons-react";
import dayjs from "dayjs";
import React from "react";

type InfoCardsProps = {
	data: Transaction[];
	selectedMonth: string;
	selectedYear: number;
};

export default function InfoCards({
	data,
	selectedMonth,
	selectedYear,
}: InfoCardsProps) {
	const totalIncome = data
		.filter(
			(transaction) =>
				transaction.type === "income" &&
				dayjs(transaction.createdAt).year() === selectedYear &&
				dayjs(transaction.createdAt).format("MMMM") === selectedMonth &&
				!transaction.excluded,
		)
		.reduce((acc, transaction) => acc + Number(transaction.amount), 0);

	const totalExpenses = data
		.filter(
			(transaction) =>
				transaction.type === "expense" &&
				dayjs(transaction.createdAt).year() === selectedYear &&
				dayjs(transaction.createdAt).format("MMMM") === selectedMonth &&
				!transaction.excluded,
		)
		.reduce((acc, transaction) => acc + Number(transaction.amount), 0);

	return (
		<div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Income</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{formatCurrency(totalIncome)}
					</CardTitle>
					{/* <CardAction>
					<Badge variant="outline">
						<IconTrendingUp />
						+12.5%
					</Badge>
				</CardAction> */}
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					Trending up this month <IconTrendingUp className="size-4" />
				</div>
				<div className="text-muted-foreground">
					Visitors for the last 6 months
				</div>
			</CardFooter> */}
			</Card>
			<Card className="@container/card">
				<CardHeader>
					<CardDescription>Total Expenses</CardDescription>
					<CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
						{formatCurrency(totalExpenses)}
					</CardTitle>
					{/* <CardAction>
					<Badge variant="outline">
						<IconTrendingUp />
						+12.5%
					</Badge>
				</CardAction> */}
				</CardHeader>
				{/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
				<div className="line-clamp-1 flex gap-2 font-medium">
					Trending up this month <IconTrendingUp className="size-4" />
				</div>
				<div className="text-muted-foreground">
					Visitors for the last 6 months
				</div>
			</CardFooter> */}
			</Card>
		</div>
	);
}
