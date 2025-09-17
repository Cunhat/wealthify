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

			// Extract history records and account data for harmonization
			const balanceAccountsHistory = balanceAccountsWithHistory.flatMap(
				(account) => account.history,
			);
			const balanceAccountsData = balanceAccountsWithHistory;

			// Harmonize balance account history to fill gaps
			const harmonizedBalanceHistory = harmonizeBalanceAccountHistory(
				balanceAccountsHistory,
				balanceAccountsData,
			);

			while (dayjs(dateIterator).isBefore(dayjs())) {
				const currDateYear = dayjs(dateIterator).year();
				const currDateMonth = dayjs(dateIterator).format("MMMM").toLowerCase();

				const netWorthForDate = harmonizedBalanceHistory.find(
					(elem) => elem.year === currDateYear,
				);

				const key = dayjs(dateIterator).format("MMM YYYY");

				netWorthData[key] =
					(netWorthData[key] ?? 0) +
					Number(
						netWorthForDate?.[currDateMonth as keyof typeof netWorthForDate] ??
							0,
					);

				dateIterator = dayjs(dateIterator).add(1, "month").toDate();
			}

			dateIterator = dayjs().subtract(1, "year").startOf("month").toDate();

			const getTransactionsFromTransAcc =
				await db.query.transactionAccount.findMany({
					where: and(eq(transactionAccount.userId, ctx.user.id)),
					with: {
						transactions: {
							where: gte(transaction.createdAt, dateIterator),
						},
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
} satisfies TRPCRouterRecord;
