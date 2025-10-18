import { db } from "@/db";
import { transaction } from "@/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../init";

export const analysesRouter = {
	getAvailableDates: protectedProcedure.query(async ({ ctx }) => {
		const firstTransaction = await db.query.transaction.findFirst({
			where: eq(transaction.userId, ctx.user.id),
			orderBy: (transaction, { asc }) => [asc(transaction.createdAt)],
		});

		return firstTransaction?.createdAt;
	}),
} satisfies TRPCRouterRecord;
