import { db } from "@/db";
import { balanceAccount, transactionAccount } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "./init";

export const accountsRouter = {
	listTransactionAccounts: protectedProcedure.query(async ({ ctx }) => {
		const transactionAccountsQuery = await db.query.transactionAccount.findMany(
			{
				where: eq(transactionAccount.userId, ctx.user.id),
				with: {
					transactions: true,
				},
			},
		);

		return [...transactionAccountsQuery];
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
				balance: z.number(),
				initial_balance: z.number(),
				name: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (input.type === "balance") {
				const account = await db.insert(balanceAccount).values({
					userId: ctx.user.id,
					type: input.type,
					balance: input.balance,
					initialBalance: input.initial_balance,
					name: input.name,
				});
			} else {
				const account = await db.insert(transactionAccount).values({
					userId: ctx.user.id,
					type: input.type,
					balance: input.balance,
					name: input.name,
				});
			}
		}),
} satisfies TRPCRouterRecord;
