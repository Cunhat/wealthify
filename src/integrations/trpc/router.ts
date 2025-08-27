import { createTRPCRouter } from "./init";

import { accountsRouter } from "./routes/accounts";
import { categoryRouter } from "./routes/category";
import { transactionRouter } from "./routes/transaction";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	transactions: transactionRouter,
});

export type TRPCRouter = typeof trpcRouter;
