import { db } from "@/db";
import { category } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "./init";

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
};
