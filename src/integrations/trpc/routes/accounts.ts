import { db } from "@/db";
import {
	balanceAccount,
	balanceAccountHistory,
	transactionAccount,
} from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import dayjs from "dayjs";
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
				const [account] = await db
					.insert(balanceAccount)
					.values({
						userId: ctx.user.id,
						type: input.type,
						balance: input.balance.toString(),
						initialBalance: input.balance.toString(),
						name: input.name,
						initialBalanceDate: input.initialBalanceDate || new Date(),
					})
					.returning();

				// Create initial balance history
				if (account) {
					const yearToCreate = dayjs(account.initialBalanceDate).year();
					const monthsToCreate = dayjs(account.initialBalanceDate)
						.format("MMMM")
						.toLowerCase();

					await db.insert(balanceAccountHistory).values({
						balanceAccountId: account.id,
						balance: account.initialBalance,
						year: yearToCreate,
						[monthsToCreate]: account.initialBalance,
						userId: ctx.user.id,
					});
				}
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
	updateBalance: protectedProcedure
		.input(z.object({ id: z.string(), balance: z.number(), date: z.date() }))
		.mutation(async ({ ctx, input }) => {
			const month = dayjs(input.date).format("MMMM").toLowerCase();
			const year = dayjs(input.date).year();

			const balanceHistory = await db
				.update(balanceAccountHistory)
				.set({
					[month]: input.balance.toString(),
				})
				.where(
					and(
						eq(balanceAccountHistory.balanceAccountId, input.id),
						eq(balanceAccountHistory.userId, ctx.user.id),
						eq(balanceAccountHistory.year, year),
					),
				)
				.returning();

			if (balanceHistory) {
				const mostRecentYearHistory =
					await db.query.balanceAccountHistory.findFirst({
						where: and(
							eq(balanceAccountHistory.balanceAccountId, input.id),
							eq(balanceAccountHistory.userId, ctx.user.id),
						),
						orderBy: (balanceAccountHistory, { desc }) => [
							desc(balanceAccountHistory.year),
						],
					});

				let latestMonthValue = null;
				if (mostRecentYearHistory) {
					for (let i = 11; i > -1; i--) {
						const monthName = dayjs().month(i).format("MMMM").toLowerCase();
						const value =
							mostRecentYearHistory[
								monthName as keyof typeof mostRecentYearHistory
							];
						if (value !== null && value !== undefined) {
							latestMonthValue = value as string;
							break;
						}
					}
				}

				if (latestMonthValue !== null) {
					await db
						.update(balanceAccount)
						.set({ balance: latestMonthValue })
						.where(
							and(
								eq(balanceAccount.id, input.id),
								eq(balanceAccount.userId, ctx.user.id),
							),
						);
				}
			}
		}),
} satisfies TRPCRouterRecord;
