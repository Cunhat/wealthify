import {
	calculateAccountNetWorth,
	harmonizeBalanceAccountHistory,
} from "@/lib/balance-harmonization";
import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import type {
	BalanceAccountWithHistory,
	TransactionAccountWithTransactions,
} from "./schemas";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(str: string) {
	if (!str) return str;

	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function balanceTransactionCalculator(
	type: "expense" | "income",
	amount: number,
	currentBalance: number,
) {
	let newBalance: number;
	if (type === "expense") {
		newBalance = currentBalance - amount;
	} else {
		newBalance = currentBalance + amount;
	}

	return newBalance.toFixed(2);
}

export const normalizeSpaces = (str: string) => str.replace(/\s+/g, " ").trim();
