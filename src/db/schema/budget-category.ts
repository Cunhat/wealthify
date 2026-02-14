import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { budget } from "./budget";
import { transaction } from "./transaction";
import { user } from "./user";

export const budgetCategory = pgTable("budget_category", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	percentage: decimal("percentage").notNull().default("0"),
	budgetId: text("budget_id")
		.notNull()
		.references(() => budget.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	recurringMetric: boolean("recurring_metric").notNull().default(false),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const budgetCategoryRelations = relations(
	budgetCategory,
	({ many, one }) => ({
		budget: one(budget, {
			fields: [budgetCategory.budgetId],
			references: [budget.id],
		}),
		transactions: many(transaction),
		user: one(user, {
			fields: [budgetCategory.userId],
			references: [user.id],
		}),
	}),
);
