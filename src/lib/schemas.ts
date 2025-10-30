import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";
import {
	balanceAccount,
	balanceAccountHistory,
	budget,
	budgetCategory,
	category,
	recurringTransaction,
	transaction,
	transactionAccount,
	wishlistCategory,
	wishlistItem,
} from "../db/schema";

export const transactionAccountSelectSchema =
	createSelectSchema(transactionAccount);

export const balanceAccountSelectSchema = createSelectSchema(balanceAccount);

export type TransactionAccount = typeof transactionAccount.$inferSelect;

export type TransactionAccountWithTransactions = z.infer<
	typeof accountWithTransactionsSchema
>;

export type BalanceAccount = z.infer<typeof balanceAccountSelectSchema>;

export type Account = TransactionAccount | BalanceAccount;

export const categorySelectSchema = createSelectSchema(category);
export type Category = z.infer<typeof categorySelectSchema>;

export const budgetCategorySelectSchema = createSelectSchema(budgetCategory);
export type BudgetCategory = z.infer<typeof budgetCategorySelectSchema>;

// Base transaction schema (without relations)
export const transactionSelectSchema = createSelectSchema(transaction);
export type TransactionBase = z.infer<typeof transactionSelectSchema>;

// Transaction schema with relations (what we get from TRPC queries)
export const transactionWithRelationsSchema = transactionSelectSchema.extend({
	category: categorySelectSchema.nullable(),
	budgetCategory: budgetCategorySelectSchema.nullable(),
	transactionAccount: transactionAccountSelectSchema.nullable(),
});

// Export Transaction with relations as the main Transaction type since that's what we use in components
export type Transaction = z.infer<typeof transactionWithRelationsSchema>;

export const balanceAccountHistorySelectSchema = createSelectSchema(
	balanceAccountHistory,
);

export const balanceAccountWithHistorySchema =
	balanceAccountSelectSchema.extend({
		history: balanceAccountHistorySelectSchema.array(),
	});

export type BalanceAccountWithHistory = z.infer<
	typeof balanceAccountWithHistorySchema
>;

const accountWithTransactionsSchema = transactionAccountSelectSchema.extend({
	transactions: transactionSelectSchema.array(),
});

export const balanceAccountHistorySchema = createSelectSchema(
	balanceAccountHistory,
);

export type BalanceAccountHistory = typeof balanceAccountHistory.$inferSelect;

// Recurring transaction schema
export const recurringTransactionSelectSchema =
	createSelectSchema(recurringTransaction);

export type RecurringTransaction = typeof recurringTransaction.$inferSelect & {
	category: Category;
};

export type Budget = typeof budget.$inferSelect & {
	categories: Array<BudgetCategory>;
};

export const wishlistCategorySelectSchema = createSelectSchema(wishlistCategory);
export type WishlistCategory = z.infer<typeof wishlistCategorySelectSchema>;

export const wishlistItemSelectSchema = createSelectSchema(wishlistItem);
export type WishlistItem = z.infer<typeof wishlistItemSelectSchema> & {
	category: WishlistCategory | null;
};
