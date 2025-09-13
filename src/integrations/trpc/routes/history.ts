import { db } from "@/db";
import { balanceAccountHistory, transactionAccountHistory } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../init";

export const historyRouter = {
	getUserHistory: protectedProcedure.query(async ({ ctx }) => {
		const balanceAccountHistoryRequest =
			db.query.balanceAccountHistory.findMany({
				where: eq(balanceAccountHistory.userId, ctx.user.id),
			});

		const transactionAccountHistoryRequest =
			db.query.transactionAccountHistory.findMany({
				where: eq(transactionAccountHistory.userId, ctx.user.id),
			});

		const [blcAccountHistory, transAccountHistory] = await Promise.all([
			balanceAccountHistoryRequest,
			transactionAccountHistoryRequest,
		]);

		return [...blcAccountHistory, ...transAccountHistory];
	}),
} satisfies TRPCRouterRecord;
