import { createTRPCRouter } from "./init";

import { accountsRouter } from "./routes/accounts";
import { categoryRouter } from "./routes/category";
import { metricsRouter } from "./routes/metrics";
import { transactionRouter } from "./routes/transaction";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	transactions: transactionRouter,
	metrics: metricsRouter,
});

export type TRPCRouter = typeof trpcRouter;
