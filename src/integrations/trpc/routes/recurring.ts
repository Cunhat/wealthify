import { db } from "@/db";
import { recurringTransaction } from "@/db/schema";
import { frequencyMonthsSchema } from "@/modules/recurring/components/utils";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const recurringRouter = {
	createRecurringTransaction: protectedProcedure
		.input(
			z.object({
				amount: z.number().min(1, "Amount is required"),
				description: z.string().optional(),
				firstOccurrence: z.date(),
				frequency: frequencyMonthsSchema,
				category: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const createdRecurringTransaction = await db
				.insert(recurringTransaction)
				.values({
					userId: ctx.user.id,
					amount: input.amount.toString(),
					description: input.description,
					firstOccurrence: input.firstOccurrence,
					frequency: input.frequency,
					createdAt: new Date(),
					category: input.category,
				})
				.returning();

			return createdRecurringTransaction[0];
		}),

	listRecurringTransactions: protectedProcedure.query(async ({ ctx }) => {
		const recurringTransactions = await db.query.recurringTransaction.findMany({
			where: eq(recurringTransaction.userId, ctx.user.id),
			orderBy: (recurringTransaction, { desc }) => [
				desc(recurringTransaction.createdAt),
			],
			with: {
				category: true,
			},
		});

		return recurringTransactions;
	}),

	deleteRecurringTransaction: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(recurringTransaction)
				.where(eq(recurringTransaction.id, input.id));
		}),
};
