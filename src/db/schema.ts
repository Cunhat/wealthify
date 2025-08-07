import { relations } from "drizzle-orm";
import {
	boolean,
	decimal,
	integer,
	pgTable,
	serial,
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
	id: text("id").primaryKey(),
	balance: integer("balance").notNull().default(0),
	initialBalance: integer("initial_balance").notNull().default(0),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const category = pgTable("category", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const transaction = pgTable("transaction", {
	id: text("id").primaryKey(),
	amount: decimal("amount").notNull(),
	description: text("description"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	transactionAccount: text("transaction_account").references(
		() => transactionAccount.id,
	),
	category: text("category").references(() => category.id),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const balanceAccount = pgTable("balance_account", {
	id: text("id").primaryKey(),
	balance: integer("balance").notNull().default(0),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const balanceAccountHistory = pgTable("balance_account_history", {
	id: text("id").primaryKey(),
	balance: decimal("balance").notNull().default("0"),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	balanceAccountId: text("balance_account_id")
		.notNull()
		.references(() => balanceAccount.id, { onDelete: "cascade" }),
	january: decimal("january").notNull().default("0"),
	february: decimal("february").notNull().default("0"),
	march: decimal("march").notNull().default("0"),
	april: decimal("april").notNull().default("0"),
	may: decimal("may").notNull().default("0"),
	june: decimal("june").notNull().default("0"),
	july: decimal("july").notNull().default("0"),
	august: decimal("august").notNull().default("0"),
	september: decimal("september").notNull().default("0"),
	october: decimal("october").notNull().default("0"),
	november: decimal("november").notNull().default("0"),
	december: decimal("december").notNull().default("0"),
	year: integer("year").notNull().default(0),
});

// export const usersRelations = relations(user, ({ many }) => ({
// 	transactionAccounts: many(transactionAccount),
// 	transactions: many(transaction),
// 	categories: many(category),
// 	balanceAccounts: many(balanceAccount),
// }));

// export const transactionAccountRelations = relations(
// 	transactionAccount,
// 	({ one, many }) => ({
// 		userId: one(user),
// 		transactions: many(transaction),
// 	}),
// );

// export const transactionRelations = relations(transaction, ({ one }) => ({
// 	userId: one(user),
// 	transactionAccount: one(transactionAccount),
// 	category: one(category),
// }));

// export const categoryRelations = relations(category, ({ one, many }) => ({
// 	userId: one(user),
// 	transactions: many(transaction),
// }));
