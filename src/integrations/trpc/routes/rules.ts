import { db } from "@/db";
import { rule, transaction } from "@/db/schema/index";
import { normalizeSpaces } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

const ruleInputSchema = z.object({
	name: z.string().min(1, "Name is required"),
	descriptionContains: z.string().min(1, "Description pattern is required"),
	categoryId: z.string().nullable().optional(),
	budgetCategoryId: z.string().nullable().optional(),
	transactionAccountId: z.string().nullable().optional(),
	type: z.enum(["expense", "income"]).nullable().optional(),
});

export const rulesRouter = {
	listRules: protectedProcedure.query(async ({ ctx }) => {
		return await db.query.rule.findMany({
			where: eq(rule.userId, ctx.user.id),
			with: {
				category: true,
				budgetCategory: true,
				transactionAccount: true,
			},
			orderBy: (r, { asc }) => [asc(r.createdAt)],
		});
	}),

	createRule: protectedProcedure
		.input(ruleInputSchema)
		.mutation(async ({ ctx, input }) => {
			const created = await db
				.insert(rule)
				.values({
					userId: ctx.user.id,
					name: input.name,
					descriptionContains: input.descriptionContains,
					categoryId: input.categoryId ?? null,
					budgetCategoryId: input.budgetCategoryId ?? null,
					transactionAccountId: input.transactionAccountId ?? null,
					type: input.type ?? null,
				})
				.returning();
			return created[0];
		}),

	bulkCreateRules: protectedProcedure
		.input(z.object({ rules: z.array(ruleInputSchema) }))
		.mutation(async ({ ctx, input }) => {
			if (input.rules.length === 0) return { created: 0 };
			const created = await db
				.insert(rule)
				.values(
					input.rules.map((r) => ({
						userId: ctx.user.id,
						name: r.name,
						descriptionContains: r.descriptionContains,
						categoryId: r.categoryId ?? null,
						budgetCategoryId: r.budgetCategoryId ?? null,
						transactionAccountId: r.transactionAccountId ?? null,
						type: r.type ?? null,
					})),
				)
				.returning();
			return { created: created.length };
		}),

	updateRule: protectedProcedure
		.input(ruleInputSchema.extend({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { id, ...fields } = input;
			await db
				.update(rule)
				.set({
					name: fields.name,
					descriptionContains: fields.descriptionContains,
					categoryId: fields.categoryId ?? null,
					budgetCategoryId: fields.budgetCategoryId ?? null,
					transactionAccountId: fields.transactionAccountId ?? null,
					type: fields.type ?? null,
				})
				.where(and(eq(rule.id, id), eq(rule.userId, ctx.user.id)));
		}),

	deleteRule: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(rule)
				.where(and(eq(rule.id, input.id), eq(rule.userId, ctx.user.id)));
		}),

	analyseTransactions: protectedProcedure.query(async ({ ctx }) => {
		const transactions = await db.query.transaction.findMany({
			where: eq(transaction.userId, ctx.user.id),
			with: {
				category: true,
				budgetCategory: true,
				transactionAccount: true,
			},
		});

		type GroupValue = {
			normalizedDescription: string;
			categoryId: string | null;
			budgetCategoryId: string | null;
			transactionAccountId: string | null;
			type: string;
			count: number;
			categoryName: string | null;
			budgetCategoryName: string | null;
			transactionAccountName: string | null;
		};

		const groups = new Map<string, GroupValue>();

		for (const tx of transactions) {
			const normalizedDescription = normalizeSpaces(
				(tx.description ?? "").toLowerCase(),
			);
			if (!normalizedDescription) continue;

			const categoryId = tx.category?.id ?? null;
			const budgetCategoryId = tx.budgetCategory?.id ?? null;

			// Only consider transactions that have both category and budget category
			if (!categoryId || !budgetCategoryId) continue;

			const key = [normalizedDescription, categoryId, budgetCategoryId].join("|");

			const existing = groups.get(key);
			if (existing) {
				existing.count += 1;
			} else {
				groups.set(key, {
					normalizedDescription,
					categoryId,
					budgetCategoryId,
					transactionAccountId: tx.transactionAccount?.id ?? null,
					type: tx.type,
					count: 1,
					categoryName: tx.category?.name ?? null,
					budgetCategoryName: tx.budgetCategory?.name ?? null,
					transactionAccountName: tx.transactionAccount?.name ?? null,
				});
			}
		}

		return Array.from(groups.values())
			.filter((g) => g.count >= 2)
			.sort((a, b) => b.count - a.count)
			.map((g) => ({
				suggestedName: g.normalizedDescription,
				descriptionContains: g.normalizedDescription,
				categoryId: g.categoryId,
				budgetCategoryId: g.budgetCategoryId,
				transactionAccountId: g.transactionAccountId,
				type: g.type as "expense" | "income",
				count: g.count,
				categoryName: g.categoryName,
				budgetCategoryName: g.budgetCategoryName,
				transactionAccountName: g.transactionAccountName,
			}));
	}),
};
