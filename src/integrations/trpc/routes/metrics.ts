import { db } from "@/db";
import {
	balanceAccount,
	balanceAccountHistory,
	transaction,
	transactionAccount,
} from "@/db/schema";

import {
	calculateAccountNetWorth,
	harmonizeBalanceAccountHistory,
} from "@/utils/balance-harmonization";
import type { TRPCRouterRecord } from "@trpc/server";
import dayjs from "dayjs";
import { and, eq, gte } from "drizzle-orm";
import { protectedProcedure } from "../init";

export const metricsRouter = {
	getNetWorth: protectedProcedure.query(async ({ ctx }) => {
		try {
			const netWorthData: {
				[key: string]: number;
			} = {};

			let dateIterator = dayjs().subtract(1, "year").startOf("month").toDate();

			//get all balance accounts with their history
			const balanceAccountsWithHistory = await db.query.balanceAccount.findMany(
				{
					where: eq(balanceAccount.userId, ctx.user.id),
					with: {
						history: {
							where: gte(
								balanceAccountHistory.year,
								dateIterator.getFullYear(),
							),
						},
					},
				},
			);

			// Harmonize balance account history to fill gaps
			const harmonizedBalanceHistory = harmonizeBalanceAccountHistory(
				balanceAccountsWithHistory,
			);

			while (dayjs(dateIterator).isBefore(dayjs())) {
				const currDateYear = dayjs(dateIterator).year();
				const currDateMonth = dayjs(dateIterator).format("MMMM").toLowerCase();

				const netWorthForDate = harmonizedBalanceHistory.filter(
					(elem) => elem.year === currDateYear,
				);

				const key = dayjs(dateIterator).format("MMM YYYY");

				const totalNetWorthForDate = netWorthForDate?.reduce(
					(acc, elem) => acc + Number(elem[currDateMonth as keyof typeof elem]),
					0,
				);

				netWorthData[key] = (netWorthData[key] ?? 0) + totalNetWorthForDate;

				dateIterator = dayjs(dateIterator).add(1, "month").toDate();
			}

			// Calculate net worth for transaction accounts

			dateIterator = dayjs().subtract(1, "year").startOf("month").toDate();

			const getTransactionsFromTransAcc =
				await db.query.transactionAccount.findMany({
					where: and(eq(transactionAccount.userId, ctx.user.id)),
					with: {
						transactions: true,
					},
				});

			for (const account of getTransactionsFromTransAcc) {
				const netWorthDataForTransAcc = calculateAccountNetWorth(account);

				for (const key in netWorthDataForTransAcc) {
					netWorthData[key] = netWorthData[key] + netWorthDataForTransAcc[key];
				}
			}

			return Object.entries(netWorthData).map(([key, value]) => ({
				date: key,
				value,
			}));
		} catch (error) {
			console.error(error);
			return null;
		}
	}),
	getIncomeVsExpenses: protectedProcedure.query(async ({ ctx }) => {
		const lastYear = dayjs().subtract(1, "year").startOf("month").toDate();

		const incomeVsExpenses = await db.query.transaction.findMany({
			where: and(
				eq(transaction.userId, ctx.user.id),
				gte(transaction.createdAt, lastYear),
			),
		});

		let currDateIterator = dayjs().subtract(1, "year").startOf("month");
		const lastYearMonthlyIncome = [];

		while (dayjs(currDateIterator).isBefore(dayjs())) {
			const currMonth = dayjs(currDateIterator).format("MMM");

			const monthlyIncome = incomeVsExpenses.filter(
				(transaction) =>
					dayjs(transaction.createdAt).isSame(currDateIterator, "month") &&
					dayjs(transaction.createdAt).isSame(currDateIterator, "year") &&
					transaction.type === "income",
			);
			const monthlyExpenses = incomeVsExpenses.filter(
				(transaction) =>
					dayjs(transaction.createdAt).isSame(currDateIterator, "month") &&
					dayjs(transaction.createdAt).isSame(currDateIterator, "year") &&
					transaction.type === "expense",
			);

			lastYearMonthlyIncome.push({
				date: currMonth,
				income: monthlyIncome.reduce(
					(acc, transaction) => acc + Number(transaction.amount),
					0,
				),
				expenses: monthlyExpenses.reduce(
					(acc, transaction) => acc + Number(transaction.amount),
					0,
				),
			});

			currDateIterator = dayjs(currDateIterator).add(1, "month");
		}

		return lastYearMonthlyIncome;
	}),
} satisfies TRPCRouterRecord;
