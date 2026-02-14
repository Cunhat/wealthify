import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { category } from "./category";
import { user } from "./user";

export const recurringTransaction = pgTable("recurring_transaction", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	amount: decimal("amount").notNull(),
	description: text("description"),
	firstOccurrence: timestamp("first_occurrence").notNull(),
	frequency: text("frequency").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	category: text("category").references(() => category.id, {
		onDelete: "set null",
	}),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const recurringTransactionRelations = relations(
	recurringTransaction,
	({ one }) => ({
		category: one(category, {
			fields: [recurringTransaction.category],
			references: [category.id],
		}),
	}),
);
