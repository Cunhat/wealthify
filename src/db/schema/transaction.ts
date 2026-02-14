import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { budgetCategory } from "./budget-category";
import { category } from "./category";
import { transactionAccount } from "./transaction-account";
import { user } from "./user";

export const transaction = pgTable("transaction", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	amount: decimal("amount").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	type: text("type").notNull().default("expense"),
	transactionAccount: text("transaction_account").references(
		() => transactionAccount.id,
		{ onDelete: "cascade" },
	),
	excluded: boolean("excluded").notNull().default(false),
	category: text("category").references(() => category.id, {
		onDelete: "set null",
	}),
	budgetCategory: text("budget_category").references(() => budgetCategory.id, {
		onDelete: "set null",
	}),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const transactionRelations = relations(transaction, ({ one }) => ({
	transactionAccount: one(transactionAccount, {
		fields: [transaction.transactionAccount],
		references: [transactionAccount.id],
	}),
	category: one(category, {
		fields: [transaction.category],
		references: [category.id],
	}),
	budgetCategory: one(budgetCategory, {
		fields: [transaction.budgetCategory],
		references: [budgetCategory.id],
	}),
	user: one(user, {
		fields: [transaction.userId],
		references: [user.id],
	}),
}));
