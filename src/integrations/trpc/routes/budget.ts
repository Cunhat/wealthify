import { db } from "@/db";
import { budget, budgetCategory } from "@/db/schema";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const budgetRouter = {
	createBudget: protectedProcedure
		.input(
			z.object({
				income: z.number(),
				categories: z.array(
					z.object({
						name: z.string(),
						percentage: z.number(),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const budgetQuery = await db.query.budget.findFirst({
				where: eq(budget.userId, ctx.user.id),
			});

			if (budgetQuery) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Budget already exists",
				});
			}

			const createdBudget = await db
				.insert(budget)
				.values({
					userId: ctx.user.id,
					income: input.income.toString(),
					createdAt: new Date(),
				})
				.returning();

			if (createdBudget && createdBudget.length > 0 && createdBudget[0]) {
				for (const category of input.categories) {
					await db.insert(budgetCategory).values({
						budgetId: createdBudget[0].id,
						name: category.name,
						percentage: category.percentage.toString(),
						userId: ctx.user.id,
					});
				}
			}
		}),
	getUserBudget: protectedProcedure.query(async ({ ctx }) => {
		const budgetQuery = await db.query.budget.findFirst({
			where: eq(budget.userId, ctx.user.id),
			with: {
				categories: true,
			},
		});

		if (!budgetQuery) {
			return null;
		}

		return budgetQuery;
	}),
} satisfies TRPCRouterRecord;
