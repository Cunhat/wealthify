import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./init";

import type { TRPCRouterRecord } from "@trpc/server";

import { db } from "@/db";
import { todosTable } from "@/db/schema";

const todosRouter = {
	list: publicProcedure.query(() => db.select().from(todosTable)),
	add: publicProcedure
		.input(z.object({ name: z.string() }))
		.mutation(async ({ input }) => {
			const newTodo = await db.insert(todosTable).values({ name: input.name });

			return newTodo;
		}),
} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	todos: todosRouter,
});
export type TRPCRouter = typeof trpcRouter;
