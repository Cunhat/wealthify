import { db } from "@/db";
import { balanceAccount, transactionAccount } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../init";

export const accountsRouter = {
	listAccounts: protectedProcedure.query(async ({ ctx }) => {
		const transactionAccountsQuery = db.query.transactionAccount.findMany({
			where: eq(transactionAccount.userId, ctx.user.id),
		});

		const balanceAccountsQuery = db.query.balanceAccount.findMany({
			where: eq(balanceAccount.userId, ctx.user.id),
		});

		const [transactionAccounts, balanceAccounts] = await Promise.all([
			transactionAccountsQuery,
			balanceAccountsQuery,
		]);

		return [...transactionAccounts, ...balanceAccounts];
	}),
	listTransactionAccounts: protectedProcedure.query(async ({ ctx }) => {
		const transactionAccountsQuery = await db.query.transactionAccount.findMany(
			{
				where: eq(transactionAccount.userId, ctx.user.id),
			},
		);

		return transactionAccountsQuery;
	}),
	listBalanceAccounts: protectedProcedure.query(async ({ ctx }) => {
		const balanceAccountsQuery = await db.query.balanceAccount.findMany({
			where: eq(balanceAccount.userId, ctx.user.id),
		});

		return [...balanceAccountsQuery];
	}),
	createAccount: protectedProcedure
		.input(
			z.object({
				type: z.string(),
				main_type: z.string(),
				balance: z.number(),
				initial_balance: z.number(),
				name: z.string(),
				initialBalanceDate: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.main_type === "balance") {
				await db.insert(balanceAccount).values({
					userId: ctx.user.id,
					type: input.type,
					balance: input.balance.toString(),
					initialBalance: input.balance.toString(),
					name: input.name,
					initialBalanceDate: input.initialBalanceDate || new Date(),
				});
			} else {
				await db.insert(transactionAccount).values({
					userId: ctx.user.id,
					type: input.type,
					balance: input.balance.toString(),
					initialBalance: input.balance.toString(),
					name: input.name,
				});
			}
		}),
	getAccount: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const balanceAccountResponse = await db.query.balanceAccount.findFirst({
				where: and(
					eq(balanceAccount.id, input.id),
					eq(balanceAccount.userId, ctx.user.id),
				),
			});

			if (balanceAccountResponse) {
				return { isTransactionAccount: false, account: balanceAccountResponse };
			}

			const account = await db.query.transactionAccount.findFirst({
				where: and(
					eq(transactionAccount.id, input.id),
					eq(transactionAccount.userId, ctx.user.id),
				),
				with: {
					transactions: {
						with: {
							category: true,
						},
					},
				},
			});

			if (account) {
				return { isTransactionAccount: true, account };
			}

			return account;
		}),
	updateAccount: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1, "Account name is required"),
				type: z.string().min(1, "Account type is required"),
				initialBalance: z
					.number()
					.min(0, "Initial balance must be non-negative"),
				isTransactionAccount: z.boolean(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.isTransactionAccount) {
				await db
					.update(transactionAccount)
					.set({
						name: input.name,
						type: input.type,
						initialBalance: input.initialBalance.toString(),
					})
					.where(
						and(
							eq(transactionAccount.id, input.id),
							eq(transactionAccount.userId, ctx.user.id),
						),
					)
					.returning({ id: transactionAccount.id });
			} else {
				await db
					.update(balanceAccount)
					.set({
						name: input.name,
						type: input.type,
						initialBalance: input.initialBalance.toString(),
					})
					.where(
						and(
							eq(balanceAccount.id, input.id),
							eq(balanceAccount.userId, ctx.user.id),
						),
					);
			}
		}),
	deleteAccount: protectedProcedure
		.input(z.object({ id: z.string(), isTransactionAccount: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			if (input.isTransactionAccount) {
				await db
					.delete(transactionAccount)
					.where(
						and(
							eq(transactionAccount.id, input.id),
							eq(transactionAccount.userId, ctx.user.id),
						),
					);
			} else {
				await db
					.delete(balanceAccount)
					.where(
						and(
							eq(balanceAccount.id, input.id),
							eq(balanceAccount.userId, ctx.user.id),
						),
					);
			}
		}),
} satisfies TRPCRouterRecord;
