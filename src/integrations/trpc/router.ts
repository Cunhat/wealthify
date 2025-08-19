import { createTRPCRouter } from "./init";

import { accountsRouter } from "./accounts";
import { categoryRouter } from "./category";
import { transactionRouter } from "./transaction";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	transactions: transactionRouter,
});

export type TRPCRouter = typeof trpcRouter;
