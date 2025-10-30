import { createTRPCRouter } from "./init";
import { accountsRouter } from "./routes/accounts";
import { analysesRouter } from "./routes/analyses";
import { budgetRouter } from "./routes/budget";
import { categoryRouter } from "./routes/category";
import { metricsRouter } from "./routes/metrics";
import { recurringRouter } from "./routes/recurring";
import { transactionRouter } from "./routes/transaction";
import { wishlistRouter } from "./routes/wishlist";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	transactions: transactionRouter,
	metrics: metricsRouter,
	recurring: recurringRouter,
	budget: budgetRouter,
	analyses: analysesRouter,
	wishlist: wishlistRouter,
});

export type TRPCRouter = typeof trpcRouter;
