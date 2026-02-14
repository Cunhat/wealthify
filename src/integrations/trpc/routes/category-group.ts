import { db } from "@/db";
import { categoryGroup } from "@/db/schema/index";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const categoryGroupRouter = {
	createCategoryGroup: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				icon: z.string(),
				color: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(categoryGroup).values({
				userId: ctx.user.id,
				...input,
			});
		}),
	listCategoryGroups: protectedProcedure.query(async ({ ctx }) => {
		return db.query.categoryGroup.findMany({
			where: eq(categoryGroup.userId, ctx.user.id),
			with: {
				categories: true,
			},
		});
	}),
	getCategoryGroup: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const result = await db.query.categoryGroup.findFirst({
				where: and(
					eq(categoryGroup.id, input.id),
					eq(categoryGroup.userId, ctx.user.id),
				),
				with: {
					categories: {
						with: {
							transactions: {
								with: {
									transactionAccount: true,
									budgetCategory: true,
								},
							},
						},
					},
				},
			});

			if (!result) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Category group not found",
				});
			}

			return result;
		}),
	updateCategoryGroup: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...data } = input;
			await db
				.update(categoryGroup)
				.set(data)
				.where(
					and(
						eq(categoryGroup.id, id),
						eq(categoryGroup.userId, ctx.user.id),
					),
				);
		}),
	deleteCategoryGroup: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(categoryGroup)
				.where(
					and(
						eq(categoryGroup.id, input.id),
						eq(categoryGroup.userId, ctx.user.id),
					),
				);
		}),
};
