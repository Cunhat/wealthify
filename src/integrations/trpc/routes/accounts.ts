import { db } from "@/db";
import { balanceAccount, transactionAccount } from "@/db/schema";
import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
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
				balance: z.number().min(0, "Balance must be non-negative"),
				initialBalance: z
					.number()
					.min(0, "Initial balance must be non-negative"),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// First, try to update in balanceAccount
			const balanceAccountResult = await db
				.update(balanceAccount)
				.set({
					name: input.name,
					balance: input.balance.toString(),
					initialBalance: input.initialBalance.toString(),
				})
				.where(
					and(
						eq(balanceAccount.id, input.id),
						eq(balanceAccount.userId, ctx.user.id),
					),
				)
				.returning({ id: balanceAccount.id });

			// If no rows were affected, try transactionAccount
			if (balanceAccountResult.length === 0) {
				const transactionAccountResult = await db
					.update(transactionAccount)
					.set({
						name: input.name,
						balance: input.balance.toString(),
						initialBalance: input.initialBalance.toString(),
					})
					.where(
						and(
							eq(transactionAccount.id, input.id),
							eq(transactionAccount.userId, ctx.user.id),
						),
					)
					.returning({ id: transactionAccount.id });

				if (transactionAccountResult.length === 0) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Account not found",
					});
				}
			}
		}),
	deleteAccount: protectedProcedure
		.input(z.object({ id: z.string(), isTransactionAccount: z.boolean() }))
		.mutation(async ({ ctx, input }) => {
			console.log(input);
			if (input.isTransactionAccount) {
				const result = await db
					.delete(transactionAccount)
					.where(
						and(
							eq(transactionAccount.id, input.id),
							eq(transactionAccount.userId, ctx.user.id),
						),
					);
				console.log(result);
			} else {
				console.log("deleting balance account");
				const result = await db
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
