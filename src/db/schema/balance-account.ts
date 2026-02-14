import { relations } from "drizzle-orm";
import { decimal, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { balanceAccountHistory } from "./balance-account-history";
import { user } from "./user";

export const balanceAccount = pgTable("balance_account", {
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

export const balanceAccountRelations = relations(
	balanceAccount,
	({ many, one }) => ({
		user: one(user, {
			fields: [balanceAccount.userId],
			references: [user.id],
		}),
		history: many(balanceAccountHistory),
	}),
);
