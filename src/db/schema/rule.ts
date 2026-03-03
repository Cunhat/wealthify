import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { budgetCategory } from "./budget-category";
import { category } from "./category";
import { transactionAccount } from "./transaction-account";
import { user } from "./user";

export const rule = pgTable("rule", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	descriptionContains: text("description_contains").notNull(),
	categoryId: text("category_id").references(() => category.id, {
		onDelete: "set null",
	}),
	budgetCategoryId: text("budget_category_id").references(
		() => budgetCategory.id,
		{ onDelete: "set null" },
	),
	transactionAccountId: text("transaction_account_id").references(
		() => transactionAccount.id,
		{ onDelete: "set null" },
	),
	type: text("type"), // "expense" | "income" | null
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
});

export const ruleRelations = relations(rule, ({ one }) => ({
	category: one(category, {
		fields: [rule.categoryId],
		references: [category.id],
	}),
	budgetCategory: one(budgetCategory, {
		fields: [rule.budgetCategoryId],
		references: [budgetCategory.id],
	}),
	transactionAccount: one(transactionAccount, {
		fields: [rule.transactionAccountId],
		references: [transactionAccount.id],
	}),
	user: one(user, {
		fields: [rule.userId],
		references: [user.id],
	}),
}));
