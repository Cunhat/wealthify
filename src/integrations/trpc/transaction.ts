import { db } from "@/db";
import { transaction } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "./init";

export const transactionRouter = {
	createTransaction: protectedProcedure
		.input(
			z.object({
				amount: z.string().min(1, "Amount is required"),
				description: z.string().optional(),
				transactionAccount: z.string().optional(),
				category: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(transaction).values({
				userId: ctx.user.id,
				amount: input.amount,
				description: input.description,
				transactionAccount: input.transactionAccount,
				category: input.category,
			});
		}),
	listTransactions: protectedProcedure.query(async ({ ctx }) => {
		const transactions = await db.query.transaction.findMany({
			where: eq(transaction.userId, ctx.user.id),
			with: {
				transactionAccount: true,
				category: true,
			},
			orderBy: (transaction, { desc }) => [desc(transaction.createdAt)],
		});
		return transactions;
	}),
	deleteTransaction: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(transaction)
				.where(
					eq(transaction.id, input.id) && eq(transaction.userId, ctx.user.id),
				);
		}),
};
