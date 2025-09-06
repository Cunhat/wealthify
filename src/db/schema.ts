import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	integer,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const transactionAccount = pgTable("transaction_account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	type: text("type").notNull(),
	name: text("name").notNull(),
	balance: decimal("balance").notNull().default("0"),
	initialBalance: decimal("initial_balance").notNull().default("0"),
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

export const category = pgTable("category", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text("name").notNull().unique(),
	icon: text("icon").notNull().default("💰"),
	color: text("color").notNull().default("#000000"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

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
	category: text("category").references(() => category.id, {
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
	user: one(user, {
		fields: [transaction.userId],
		references: [user.id],
	}),
}));

export const categoryRelations = relations(category, ({ many, one }) => ({
	transactions: many(transaction),
	user: one(user, {
		fields: [category.userId],
		references: [user.id],
	}),
}));

export const balanceAccount = pgTable("balance_account", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	type: text("type").notNull(),
	name: text("name").notNull(),
	balance: decimal("balance").notNull().default("0"),
	initialBalance: decimal("initial_balance").notNull().default("0"),
	initialBalanceDate: timestamp("initial_balance_date").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

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
