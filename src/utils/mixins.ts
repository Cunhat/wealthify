import type { Transaction } from "@/lib/schemas";
import dayjs from "dayjs";

export function formatCurrency(number: number) {
	return `${number.toLocaleString("pt-PT", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})} €`;
}

function formatDateGroup(date: Date) {
	const formattedDate = dayjs(date);

	if (formattedDate.isSame(dayjs(), "day")) {
		return "Today";
	}

	if (formattedDate.isSame(dayjs().subtract(1, "day"), "day")) {
		return "Yesterday";
	}

	return formattedDate.format("ddd, MMMM D");
}

export function groupTransactionsByDate(transactions: Transaction[]) {
	const groups: { [key: string]: Transaction[] } = {};

	for (const transaction of transactions) {
		if (!transaction.createdAt) continue;

		const dateGroup = formatDateGroup(transaction?.createdAt);

		if (!groups[dateGroup]) {
			groups[dateGroup] = [];
		}

		groups[dateGroup].push(transaction);
	}

	return groups;
}
