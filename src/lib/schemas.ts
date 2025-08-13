import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { balanceAccount, transactionAccount } from "../db/schema";

export const transactionAccountSelectSchema =
	createSelectSchema(transactionAccount);

export const balanceAccountSelectSchema = createSelectSchema(balanceAccount);

export type TransactionAccount = z.infer<typeof transactionAccountSelectSchema>;
export type BalanceAccount = z.infer<typeof balanceAccountSelectSchema>;

export type Account = TransactionAccount | BalanceAccount;
