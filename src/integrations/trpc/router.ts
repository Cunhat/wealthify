import { createTRPCRouter } from "./init";

import { accountsRouter } from "./routes/accounts";
import { categoryRouter } from "./routes/category";
import { historyRouter } from "./routes/history";
import { transactionRouter } from "./routes/transaction";

export const trpcRouter = createTRPCRouter({
	accounts: accountsRouter,
	categories: categoryRouter,
	transactions: transactionRouter,
	history: historyRouter,
});

export type TRPCRouter = typeof trpcRouter;
