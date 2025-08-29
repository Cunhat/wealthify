import { db } from "@/db";
import { category } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const categoryRouter = {
	createCategory: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				icon: z.string(),
				color: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(category).values({
				userId: ctx.user.id,
				...input,
			});
		}),
	listCategories: protectedProcedure.query(async ({ ctx }) => {
		const categories = await db.query.category.findMany({
			where: eq(category.userId, ctx.user.id),
		});
		return categories;
	}),
	getCategory: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const response = await db.query.category.findFirst({
				where: and(eq(category.id, input.id), eq(category.userId, ctx.user.id)),
				with: {
					transactions: {
						with: {
							transactionAccount: true,
						},
					},
				},
			});

			if (!response) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Category not found",
				});
			}

			return response;
		}),
	updateCategory: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				icon: z.string().optional(),
				color: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			// Only include fields that were provided
			const fieldsToUpdate: Partial<{
				name: string;
				icon: string;
				color: string;
			}> = {};

			if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
			if (updateData.icon !== undefined) fieldsToUpdate.icon = updateData.icon;
			if (updateData.color !== undefined)
				fieldsToUpdate.color = updateData.color;

			await db
				.update(category)
				.set(fieldsToUpdate)
				.where(and(eq(category.id, id), eq(category.userId, ctx.user.id)));
		}),
	deleteCategory: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(category)
				.where(
					and(eq(category.id, input.id), eq(category.userId, ctx.user.id)),
				);
		}),
};
