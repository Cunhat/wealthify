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

				console.log(netWorthDataForTransAcc);

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
