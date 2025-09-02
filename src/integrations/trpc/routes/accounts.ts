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
					balance: input.balance,
					initialBalance: input.balance,
					name: input.name,
				});
			} else {
				await db.insert(transactionAccount).values({
					userId: ctx.user.id,
					type: input.type,
					balance: input.balance,
					initialBalance: input.balance,
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
				return balanceAccountResponse;
			}
			const account = await db.query.transactionAccount.findFirst({
				where: and(
					eq(transactionAccount.id, input.id),
					eq(transactionAccount.userId, ctx.user.id),
				),
			});
			return account;
		}),
} satisfies TRPCRouterRecord;
