import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { categoryGroup } from "./category-group";
import { recurringTransaction } from "./recurring-transaction";
import { transaction } from "./transaction";
import { user } from "./user";

export const category = pgTable("category", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull(),
	icon: text("icon").notNull().default("💰"),
	color: text("color").notNull().default("#000000"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	groupId: text("group_id").references(() => categoryGroup.id, {
		onDelete: "set null",
	}),
});

export const categoryRelations = relations(category, ({ many, one }) => ({
	transactions: many(transaction),
	user: one(user, {
		fields: [category.userId],
		references: [user.id],
	}),
	recurringTransactions: many(recurringTransaction),
	group: one(categoryGroup, {
		fields: [category.groupId],
		references: [categoryGroup.id],
	}),
}));
