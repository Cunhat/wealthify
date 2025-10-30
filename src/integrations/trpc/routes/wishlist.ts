import { db } from "@/db";
import { wishlistCategory, wishlistItem } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

const wishlistStatusEnum = z.enum([
	"Do I really want this?",
	"I really want this",
	"I will buy this",
	"Purchased",
]);

export const wishlistRouter = {
	// Wishlist Category Routes
	createWishlistCategory: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				icon: z.string(),
				color: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(wishlistCategory).values({
				userId: ctx.user.id,
				...input,
			});
		}),
	listWishlistCategories: protectedProcedure.query(async ({ ctx }) => {
		const categories = await db.query.wishlistCategory.findMany({
			where: eq(wishlistCategory.userId, ctx.user.id),
		});
		return categories;
	}),
	updateWishlistCategory: protectedProcedure
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
				.update(wishlistCategory)
				.set(fieldsToUpdate)
				.where(
					and(
						eq(wishlistCategory.id, id),
						eq(wishlistCategory.userId, ctx.user.id),
					),
				);
		}),
	deleteWishlistCategory: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(wishlistCategory)
				.where(
					and(
						eq(wishlistCategory.id, input.id),
						eq(wishlistCategory.userId, ctx.user.id),
					),
				);
		}),

	// Wishlist Item Routes
	createWishlistItem: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name is required"),
				price: z.number().min(0, "Price must be positive"),
				status: wishlistStatusEnum.optional(),
				category: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await db.insert(wishlistItem).values({
				userId: ctx.user.id,
				name: input.name,
				price: input.price.toString(),
				status: input.status ?? "Do I really want this?",
				category: input.category,
			});
		}),
	listWishlistItems: protectedProcedure.query(async ({ ctx }) => {
		const items = await db.query.wishlistItem.findMany({
			where: eq(wishlistItem.userId, ctx.user.id),
			with: {
				category: true,
			},
			orderBy: (items, { desc }) => [desc(items.createdAt)],
		});
		return items;
	}),
	updateWishlistItem: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				price: z.number().optional(),
				status: wishlistStatusEnum.optional(),
				category: z.string().optional().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { id, ...updateData } = input;

			const fieldsToUpdate: Partial<{
				name: string;
				price: string;
				status: string;
				category: string | null;
			}> = {};

			if (updateData.name !== undefined) fieldsToUpdate.name = updateData.name;
			if (updateData.price !== undefined)
				fieldsToUpdate.price = updateData.price.toString();
			if (updateData.status !== undefined)
				fieldsToUpdate.status = updateData.status;
			if (updateData.category !== undefined)
				fieldsToUpdate.category = updateData.category;

			await db
				.update(wishlistItem)
				.set(fieldsToUpdate)
				.where(
					and(eq(wishlistItem.id, id), eq(wishlistItem.userId, ctx.user.id)),
				);
		}),
	deleteWishlistItem: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(wishlistItem)
				.where(
					and(
						eq(wishlistItem.id, input.id),
						eq(wishlistItem.userId, ctx.user.id),
					),
				);
		}),
};

