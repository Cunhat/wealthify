import { db } from "@/db";
import { balanceAccount, transactionAccount } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "./init";

export const accountsRouter = {
	list: protectedProcedure.query(async ({ ctx }) => {
		const transactionAccountQuery = db
			.select()
			.from(transactionAccount)
			.where(eq(transactionAccount.userId, ctx.user.id));

		const balanceAccountQuery = db
			.select()
			.from(balanceAccount)
			.where(eq(balanceAccount.userId, ctx.user.id));

		const [transactionAccounts, balanceAccounts] = await Promise.all([
			transactionAccountQuery,
			balanceAccountQuery,
		]);

		return [...transactionAccounts, ...balanceAccounts];
	}),
} satisfies TRPCRouterRecord;
