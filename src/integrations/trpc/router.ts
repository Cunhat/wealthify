import { createTRPCRouter } from "./init";
import { accountsRouter } from "./routes/accounts";
import { analysesRouter } from "./routes/analyses";
import { budgetRouter } from "./routes/budget";
import { categoryGroupRouter } from "./routes/category-group";
import { categoryRouter } from "./routes/category";
import { metricsRouter } from "./routes/metrics";
import { recurringRouter } from "./routes/recurring";
import { transactionRouter } from "./routes/transaction";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	categoryGroups: categoryGroupRouter,
	transactions: transactionRouter,
	metrics: metricsRouter,
	recurring: recurringRouter,
	budget: budgetRouter,
	analyses: analysesRouter,
});

export type TRPCRouter = typeof trpcRouter;
