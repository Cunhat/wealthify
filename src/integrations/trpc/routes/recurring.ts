import { db } from "@/db";
import { recurringTransaction } from "@/db/schema/index";
import { frequencyMonthsSchema } from "@/modules/recurring/components/utils";
import { and, eq } from "drizzle-orm";
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
	updateRecurringTransaction: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				amount: z.number().min(1, "Amount is required").optional(),
				description: z.string().optional(),
				firstOccurrence: z.date().optional(),
				frequency: frequencyMonthsSchema.optional(),
				category: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Build update object, filtering out undefined values
			const updateValues: Record<string, string | Date> = {};
			if (updateData.amount !== undefined) {
				updateValues.amount = updateData.amount.toString();
			}
			if (updateData.description !== undefined) {
				updateValues.description = updateData.description;
			}
			if (updateData.firstOccurrence !== undefined) {
				updateValues.firstOccurrence = updateData.firstOccurrence;
			}
			if (updateData.frequency !== undefined) {
				updateValues.frequency = updateData.frequency;
			}
			if (updateData.category !== undefined) {
				updateValues.category = updateData.category;
			}

			updateValues.updatedAt = new Date();

			const updatedRecurringTransaction = await db
				.update(recurringTransaction)
				.set(updateValues)
				.where(
					and(
						eq(recurringTransaction.id, id),
						eq(recurringTransaction.userId, ctx.user.id),
					),
				)
				.returning();

			return updatedRecurringTransaction[0];
		}),

	deleteRecurringTransaction: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(recurringTransaction)
				.where(
					and(
						eq(recurringTransaction.id, input.id),
						eq(recurringTransaction.userId, ctx.user.id),
					),
				);
		}),
};
