import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { transaction } from "./transaction";
import { user } from "./user";

export const transactionAccount = pgTable("transaction_account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	type: text("type").notNull(),
	name: text("name").notNull(),
	balance: decimal("balance").notNull().default("0"),
	initialBalance: decimal("initial_balance").notNull().default("0"),
	initialBalanceDate: timestamp("initial_balance_date")
		.notNull()
		.default(new Date()),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const transactionAccountRelations = relations(
	transactionAccount,
	({ many, one }) => ({
		transactions: many(transaction),
		user: one(user, {
			fields: [transactionAccount.userId],
			references: [user.id],
		}),
	}),
);
