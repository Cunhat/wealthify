import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { budgetCategory } from "./budget-category";
import { user } from "./user";

export const budget = pgTable("budget", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	income: decimal("income").notNull().default("0"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const budgetRelations = relations(budget, ({ many, one }) => ({
	categories: many(budgetCategory),
	user: one(user, {
		fields: [budget.userId],
		references: [user.id],
	}),
}));
