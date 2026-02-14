import { relations } from "drizzle-orm";
import {
	decimal,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

import { balanceAccount } from "./balance-account";
import { user } from "./user";

export const balanceAccountHistory = pgTable("balance_account_history", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	balance: decimal("balance").notNull().default("0"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	balanceAccountId: text("balance_account_id")
		.notNull()
		.references(() => balanceAccount.id, { onDelete: "cascade" }),
	january: decimal("january"),
	february: decimal("february"),
	march: decimal("march"),
	april: decimal("april"),
	may: decimal("may"),
	june: decimal("june"),
	july: decimal("july"),
	august: decimal("august"),
	september: decimal("september"),
	october: decimal("october"),
	november: decimal("november"),
	december: decimal("december"),
	year: integer("year").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const balanceAccountHistoryRelations = relations(
	balanceAccountHistory,
	({ one }) => ({
		balanceAccount: one(balanceAccount, {
			fields: [balanceAccountHistory.balanceAccountId],
			references: [balanceAccount.id],
		}),
		user: one(user, {
			fields: [balanceAccountHistory.userId],
			references: [user.id],
		}),
	}),
);
