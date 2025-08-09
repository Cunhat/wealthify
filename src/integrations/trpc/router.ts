import { createTRPCRouter } from "./init";

import { accountsRouter } from "./accounts";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
});

export type TRPCRouter = typeof trpcRouter;
