import type {
	BalanceAccountHistory,
	BalanceAccountWithHistory,
	TransactionAccountWithTransactions,
} from "@/lib/schemas";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

type MonthName =
	| "january"
	| "february"
	| "march"
	| "april"
	| "may"
	| "june"
	| "july"
	| "august"
	| "september"
	| "october"
	| "november"
	| "december";

const monthNames: MonthName[] = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december",
];

export const harmonizeBalanceAccountHistory = (
	accountsWithHistory: BalanceAccountWithHistory[],
) => {
	const harmonizedRecords: BalanceAccountHistory[] = [];

	// Process each account with its history
	for (const accountWithHistory of accountsWithHistory) {
		const account = accountWithHistory;
		const records = accountWithHistory.history;

		// Sort records by year
		const sortedRecords = [...records].sort((a, b) => a.year - b.year);

		// Get the initial balance date to know when to start harmonizing
		const initialBalanceDate = dayjs(account.initialBalanceDate);
		const initialBalanceMonth = initialBalanceDate.month(); // 0-based
		const initialBalanceYear = initialBalanceDate.year();

		let globalLastKnownValue: string | null = null;

		for (const record of sortedRecords) {
			const harmonizedRecord = { ...record };

			// For each month in the year
			for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
				const monthName = monthNames[monthIndex];
				const currentValue = record[monthName];

				// Skip months before the initial balance date
				if (
					record.year === initialBalanceYear &&
					monthIndex < initialBalanceMonth
				) {
					continue;
				}

				if (currentValue !== null && currentValue !== undefined) {
					// Update the global last known value when we find a non-null value
					globalLastKnownValue = currentValue as string;
				} else if (globalLastKnownValue !== null) {
					// Fill gap with the last known value across years
					(harmonizedRecord[monthName] as string | null) = globalLastKnownValue;
				}
			}

			harmonizedRecords.push(harmonizedRecord);
		}
	}

	return harmonizedRecords;
};

export const calculateAccountNetWorth = (
	account: TransactionAccountWithTransactions,
) => {
	const netWorthData: {
		[key: string]: number;
	} = {};

	let dateIterator = dayjs(account.initialBalanceDate).utc();
	console.log(
		"Date Iterator ----> ",
		dateIterator.format("DD/MM/YYYY HH:mm:ss"),
	);
	let currNetWorth = Number(account.initialBalance);

	while (dateIterator.isBefore(dayjs().utc())) {
		const key = dateIterator.format("MMM YYYY");

		const monthlyTransactions = account.transactions.filter(
			(elem) =>
				dayjs(elem.createdAt).isSame(dateIterator, "month") &&
				dayjs(elem.createdAt).isSame(dateIterator, "year"),
		);

		currNetWorth = monthlyTransactions?.reduce((acc, elem) => {
			if (elem.type === "expense") {
				return acc - Number(elem.amount);
			}

			return acc + Number(elem.amount);
		}, currNetWorth);

		currNetWorth = Number(currNetWorth.toFixed(2));
		netWorthData[key] = currNetWorth;
		dateIterator = dayjs(dateIterator).add(1, "month");
	}

	return netWorthData;
};
