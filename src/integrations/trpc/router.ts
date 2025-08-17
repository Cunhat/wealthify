import { createTRPCRouter } from "./init";

import { accountsRouter } from "./accounts";
import { categoryRouter } from "./category";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
});

export type TRPCRouter = typeof trpcRouter;
