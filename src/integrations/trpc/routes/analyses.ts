import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import dayjs from "dayjs";
import { and, eq, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const analysesRouter = {
	getAvailableDates: protectedProcedure.query(async ({ ctx }) => {
		const firstTransaction = await db.query.transaction.findFirst({
			where: eq(transaction.userId, ctx.user.id),
			orderBy: (transaction, { asc }) => [asc(transaction.createdAt)],
		});

		return firstTransaction?.createdAt;
	}),
	getTransactionsForPeriod: protectedProcedure
		.input(
			z.object({
				year: z.number(),
				month: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			const dateStr = `${input.year}-${input.month}-01`;
			const date = dayjs(dateStr);

			if (!date.isValid()) {
				throw new Error(`Invalid date: ${dateStr}`);
			}

			const startDate = date.toDate();
			const endDate = date.endOf("month").toDate();

			return await db.query.transaction.findMany({
				where: and(
					eq(transaction.userId, ctx.user.id),
					gte(transaction.createdAt, startDate),
					lte(transaction.createdAt, endDate),
				),
				with: {
					transactionAccount: true,
					category: true,
					budgetCategory: true,
				},
			});
		}),
} satisfies TRPCRouterRecord;
