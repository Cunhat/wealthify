import { db } from "@/db";
import { balanceAccount, transactionAccount } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
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
} satisfies TRPCRouterRecord;
